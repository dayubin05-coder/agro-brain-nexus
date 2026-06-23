import { memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  LayoutDashboard,
  MapPin,
  Sprout,
  DollarSign,
  Package,
  Truck,
  Users,
  Bug,
  Cloud,
  TrendingUp,
  ShoppingCart,
  Bot,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Recycle,
  FileText,
  UserCircle,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: MapPin, label: "Fazendas", path: "/fazendas" },
  { icon: Layers, label: "Talhões", path: "/talhoes" },
  { icon: Sprout, label: "Plantio & Colheita", path: "/plantio" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: Truck, label: "Máquinas", path: "/maquinas" },
  { icon: Users, label: "Funcionários", path: "/funcionarios" },
  { icon: Cloud, label: "Clima", path: "/clima" },
  { icon: Bug, label: "Pragas & Doenças", path: "/pragas" },
  { icon: TrendingUp, label: "Mercado", path: "/mercado" },
  { icon: ShoppingCart, label: "Marketplace", path: "/marketplace" },
  { icon: Bot, label: "IA Agrícola", path: "/ia" },
  { icon: Recycle, label: "Sustentabilidade", path: "/sustentabilidade" },
  { icon: FileText, label: "Relatórios", path: "/relatorios" },
  { icon: ShieldCheck, label: "Auditoria RLS", path: "/auditoria-rls" },
  { icon: UserCircle, label: "Meu Perfil", path: "/perfil" },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onNavigateTo: (path: string) => void;
  onNavigate?: () => void;
}

function AppSidebar({ collapsed, setCollapsed, onNavigateTo, onNavigate }: AppSidebarProps) {
  const initialPathRef = useRef(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 h-dvh z-50 flex flex-col bg-sidebar border-r border-sidebar-border shadow-lg"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shrink-0 shadow-glow ring-1 ring-white/10">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-display text-lg font-bold text-sidebar-foreground tracking-tight">
                AgroTech
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40 -mt-0.5 font-medium">
                Use Sistemas
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = initialPathRef.current === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { onNavigateTo(item.path); onNavigate?.(); }}
              title={collapsed ? item.label : undefined}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-sidebar-primary/20 via-sidebar-primary/10 to-transparent ring-1 ring-sidebar-primary/25"
                />
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-primary" />
              )}
              <item.icon className={`relative z-10 w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? "text-sidebar-primary" : ""}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="relative z-10 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="w-full flex items-center justify-center py-2 rounded-xl text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}

export default memo(AppSidebar);
