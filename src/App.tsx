import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Fazendas from "./pages/Fazendas";
import Talhoes from "./pages/Talhoes";
import Plantio from "./pages/Plantio";
import Financeiro from "./pages/Financeiro";
import Estoque from "./pages/Estoque";
import Maquinas from "./pages/Maquinas";
import Funcionarios from "./pages/Funcionarios";
import Clima from "./pages/Clima";
import Pragas from "./pages/Pragas";
import Mercado from "./pages/Mercado";
import Marketplace from "./pages/Marketplace";
import IAAgricola from "./pages/IAAgricola";
import Sustentabilidade from "./pages/Sustentabilidade";
import Perfil from "./pages/Perfil";
import Relatorios from "./pages/Relatorios";
import AuditoriaRLS from "./pages/AuditoriaRLS";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AuthGuard>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/fazendas" element={<Fazendas />} />
                  <Route path="/talhoes" element={<Talhoes />} />
                  <Route path="/plantio" element={<Plantio />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/estoque" element={<Estoque />} />
                  <Route path="/maquinas" element={<Maquinas />} />
                  <Route path="/funcionarios" element={<Funcionarios />} />
                  <Route path="/clima" element={<Clima />} />
                  <Route path="/pragas" element={<Pragas />} />
                  <Route path="/mercado" element={<Mercado />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/ia" element={<IAAgricola />} />
                  <Route path="/sustentabilidade" element={<Sustentabilidade />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/auditoria-rls" element={<AuditoriaRLS />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthGuard>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
