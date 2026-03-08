import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Fazendas from "./pages/Fazendas";
import Financeiro from "./pages/Financeiro";
import ComingSoon from "./components/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fazendas" element={<Fazendas />} />
            <Route path="/plantio" element={<ComingSoon title="Plantio & Colheita" description="Gerencie todo o ciclo de plantio, monitoramento e colheita das suas culturas." />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/estoque" element={<ComingSoon title="Gestão de Estoque" description="Controle sementes, fertilizantes, defensivos e todos os insumos da fazenda." />} />
            <Route path="/maquinas" element={<ComingSoon title="Gestão de Máquinas" description="Monitore tratores, colheitadeiras, horas de uso e manutenção preventiva." />} />
            <Route path="/funcionarios" element={<ComingSoon title="Gestão de Funcionários" description="Cadastro de trabalhadores, tarefas, produtividade e folha de pagamento." />} />
            <Route path="/clima" element={<ComingSoon title="Monitoramento Climático" description="Previsão do tempo, alertas de geada, chuvas e dados de estações meteorológicas." />} />
            <Route path="/pragas" element={<ComingSoon title="Pragas & Doenças" description="Detecção de pragas, diagnóstico por IA e recomendações de controle." />} />
            <Route path="/mercado" element={<ComingSoon title="Mercado de Commodities" description="Preços em tempo real, análise de mercado e recomendações de venda." />} />
            <Route path="/marketplace" element={<ComingSoon title="Marketplace Agrícola" description="Compre insumos, venda produção e contrate serviços agrícolas." />} />
            <Route path="/ia" element={<ComingSoon title="IA Agrícola" description="Assistente inteligente, previsão de safra, diagnóstico por foto e simulações." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
