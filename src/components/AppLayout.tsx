import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import ThemeToggle from "./ThemeToggle";
import NotificationsPanel from "./NotificationsPanel";
import { Bell, Search, User, LogOut, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
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
    queryKey: ["notifications"],
    select: (data: any[]) => data?.length || 0,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await supabase.from("profiles").select("nome, tipo, avatar_url").eq("id", userData.user.id).single();
      return data;
    },
  });

  const avatarUrl = profile?.avatar_url
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data.publicUrl
    : null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[260px] bg-sidebar border-sidebar-border">
            <AppSidebar
              collapsed={false}
              setCollapsed={() => {}}
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
        <header className="sticky top-0 z-40 h-14 md:h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-3 md:px-6 shadow-sm gap-2">
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar fazendas, culturas, relatórios..."}
                className="w-full bg-muted/50 border border-transparent rounded-full pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:bg-background focus:border-primary/30 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
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
                <button className="flex items-center gap-3 hover:bg-muted p-1.5 md:pr-3 rounded-full transition-colors outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground leading-none">{profile?.nome || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{profile?.tipo || "produtor"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/perfil")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
