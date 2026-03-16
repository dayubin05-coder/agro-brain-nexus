import { useLocation, useNavigate } from "react-router-dom";
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
  { icon: UserCircle, label: "Meu Perfil", path: "/perfil" },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onNavigate?: () => void;
}

export default function AppSidebar({ collapsed, setCollapsed, onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary shrink-0">
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
              <span className="font-display text-lg font-bold text-sidebar-foreground">
                AgroTech
              </span>
              <span className="block text-xs text-sidebar-foreground/50 -mt-1">
                Use Sistemas
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); onNavigate?.(); }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-6 rounded-r-full bg-sidebar-primary"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
