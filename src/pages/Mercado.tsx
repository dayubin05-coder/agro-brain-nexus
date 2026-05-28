import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";

interface Commodity {
  nome: string;
  preco: string;
  variacao: string;
  tipo: string;
  tendencia: string;
  previsao: string;
}

interface CommodityData {
  commodities: Commodity[];
  historico: Record<string, { data: string; preco: number }[]>;
  updatedAt: string;
}

const recomendacoes = [
  { cultura: "Soja", acao: "Aguardar", desc: "Preço em queda. Previsão de recuperação em 30 dias. Armazene se possível.", urgencia: "media" },
  { cultura: "Milho", acao: "Vender parcial", desc: "Preço em tendência de alta. Vender 30-40% da produção agora.", urgencia: "alta" },
  { cultura: "Algodão", acao: "Aguardar", desc: "Forte tendência de alta. Segurar para maximizar lucro.", urgencia: "baixa" },
  { cultura: "Café", acao: "Vender", desc: "Preço no maior patamar dos últimos 12 meses. Momento ideal para venda.", urgencia: "alta" },
];

const urgColor: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baixa: "bg-success/10 text-success",
};

const chartColors = ["hsl(152, 55%, 28%)", "hsl(40, 60%, 50%)", "hsl(200, 80%, 50%)", "hsl(25, 70%, 40%)", "hsl(280, 60%, 50%)"];

export default function Mercado() {
  const [selectedChart, setSelectedChart] = useState<string>("");

  const { data, isLoading, refetch, isFetching } = useQuery<CommodityData>({
    queryKey: ["commodity-prices"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commodity-prices`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch prices");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const commodities = data?.commodities || [];
  const historico = data?.historico || {};
  const topCommodities = commodities.slice(0, 4);

  // Default to first commodity for chart
  const activeChart = selectedChart || commodities[0]?.nome || "";
  const activeHistorico = historico[activeChart] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Mercado de Commodities</h1>
          <p className="text-muted-foreground text-sm mt-1">Preços, tendências e recomendações de venda</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topCommodities.map((c, i) => (
              <MetricCard
                key={c.nome}
                icon={c.tipo === "positiva" ? TrendingUp : TrendingDown}
                title={c.nome.split(" (")[0]}
                value={`R$ ${parseFloat(c.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                change={`${c.variacao} esta semana`}
                changeType={c.tipo === "positiva" ? "positive" : "negative"}
                delay={i * 0.1}
              />
            ))}
          </div>

          {/* Commodity cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commodities.map((c, i) => (
              <motion.div
                key={c.nome}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-card rounded-xl p-5 shadow-card border cursor-pointer transition-colors ${
                  activeChart === c.nome ? "border-primary" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedChart(c.nome)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-display font-semibold text-foreground">{c.nome}</h4>
                  <span className={`flex items-center gap-1 text-xs font-medium ${c.tipo === "positiva" ? "text-success" : "text-destructive"}`}>
                    {c.tipo === "positiva" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {c.variacao}
                  </span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  R$ {parseFloat(c.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <p className="text-xs text-muted-foreground">Tendência: <span className="text-foreground font-medium">{c.tendencia}</span></p>
                  <p className="text-xs text-muted-foreground">Previsão: <span className="text-foreground font-medium">{c.previsao}</span></p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          {activeHistorico.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border">
              <h3 className="font-display font-semibold text-foreground mb-4">Histórico — {activeChart} (R$)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={activeHistorico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="data" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="preco" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} name="Preço" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* AI Recommendations */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border">
            <h3 className="font-display font-semibold text-foreground mb-4">🤖 Recomendações de Venda (IA)</h3>
            <div className="space-y-3">
              {recomendacoes.map((r, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                  <div className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg ${urgColor[r.urgencia]}`}>
                    {r.acao}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{r.cultura}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
