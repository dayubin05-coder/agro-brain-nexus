import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import AppLayout from "./components/AppLayout";
import AuthGuard from "./components/AuthGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import { RouteFallback } from "./components/PageSkeleton";
import { usePageTracking } from "./hooks/use-page-tracking";
import { idbPersister } from "./lib/offline-persister";
import { replayQueue } from "./lib/offline-queue";

// Auth pages (small, eager — needed on first paint when logged out)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy-loaded app pages (code split per route)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Fazendas = lazy(() => import("./pages/Fazendas"));
const Talhoes = lazy(() => import("./pages/Talhoes"));
const Plantio = lazy(() => import("./pages/Plantio"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Estoque = lazy(() => import("./pages/Estoque"));
const Maquinas = lazy(() => import("./pages/Maquinas"));
const Funcionarios = lazy(() => import("./pages/Funcionarios"));
const Clima = lazy(() => import("./pages/Clima"));
const Pragas = lazy(() => import("./pages/Pragas"));
const Mercado = lazy(() => import("./pages/Mercado"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const IAAgricola = lazy(() => import("./pages/IAAgricola"));
const Sustentabilidade = lazy(() => import("./pages/Sustentabilidade"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const AuditoriaRLS = lazy(() => import("./pages/AuditoriaRLS"));

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

const RouteTracker = () => {
  usePageTracking();
  return null;
};

const OnlineReplay = () => {
  useEffect(() => {
    const handler = () => void replayQueue();
    window.addEventListener("online", handler);
    if (navigator.onLine) void replayQueue();
    return () => window.removeEventListener("online", handler);
  }, []);
  return null;
};

const App = () => (
  <ThemeProvider>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: idbPersister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        buster: "v1",
      }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <OnlineReplay />
        <BrowserRouter>
          <AuthProvider>
            <AuthGuard>
              <ErrorBoundary>
                <Suspense fallback={<RouteFallback />}>
                  <RouteTracker />
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
                </Suspense>
              </ErrorBoundary>
            </AuthGuard>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </PersistQueryClientProvider>
  </ThemeProvider>
);

export default App;
