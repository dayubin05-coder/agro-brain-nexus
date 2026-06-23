import { Suspense, useCallback, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { RouteFallback } from "./PageSkeleton";
import AppSidebar from "./AppSidebar";
import ThemeToggle from "./ThemeToggle";
import NotificationsPanel from "./NotificationsPanel";
import { Bell, Search, User, LogOut, Settings, Menu } from "lucide-react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { profileService } from "@/services/profile.service";
import { authService } from "@/services/auth.service";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: notifCount = 0 } = useQuery({
    queryKey: qk.notifications(),
    select: (data: any[]) => data?.length || 0,
  });

  const { data: user } = useCurrentUser();

  const { data: profile } = useQuery({
    queryKey: qk.profile(user?.id),
    enabled: !!user,
    queryFn: () => profileService.getById(user!.id),
  });

  const avatarUrl = profile?.avatar_url
    ? profileService.getAvatarPublicUrl(profile.avatar_url)
    : null;

  const handleLogout = async () => {
    await authService.signOut();
    navigate("/login");
  };

  const handleSidebarNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-background gradient-subtle">
      {/* Skip link (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-md"
      >
        Pular para o conteúdo
      </a>

      {!isMobile && (
        <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} onNavigateTo={handleSidebarNavigate} />
      )}

      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[260px] bg-sidebar border-sidebar-border">
            <AppSidebar
              collapsed={false}
              setCollapsed={() => {}}
              onNavigateTo={handleSidebarNavigate}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      <div
        className={cn(
          "transition-all duration-300 ease-in-out flex flex-col min-h-screen",
          isMobile ? "ml-0" : collapsed ? "ml-[72px]" : "ml-[260px]"
        )}
      >
        <header className="sticky top-0 z-40 h-14 md:h-16 bg-card/75 backdrop-blur-xl border-b border-border/60 flex items-center justify-between px-3 md:px-6 gap-2 supports-[backdrop-filter]:bg-card/60">
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu de navegação"
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative w-full group">
              <label htmlFor="global-search" className="sr-only">{t("common.search")}</label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
              <input
                id="global-search"
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar fazendas, culturas, relatórios..."}
                className="w-full bg-muted/60 border border-transparent rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:bg-background focus:border-primary/40 focus:shadow-ring transition-all"
              />
            </div>
          </div>


          <div className="flex items-center gap-1 md:gap-3">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label={`Notificações${notifCount > 0 ? ` (${notifCount} não lidas)` : ""}`}
                aria-expanded={notifOpen}
                className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
              <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div className="h-6 w-px bg-border hidden md:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Menu da conta" className="flex items-center gap-3 hover:bg-muted p-1.5 md:pr-3 rounded-full transition-colors outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground leading-none">{profile?.nome || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{profile?.tipo || "produtor"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("common.account")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/perfil")}>
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t("common.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t("common.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full focus:outline-none">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
