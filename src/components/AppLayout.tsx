import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { Bell, Search, User } from "lucide-react";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="ml-[260px] transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar fazendas, culturas, relatórios..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">Produtor</p>
                <p className="text-xs text-muted-foreground">Fazenda Demo</p>
              </div>
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
