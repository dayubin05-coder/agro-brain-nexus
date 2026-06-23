import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { mercadoService, type CommodityData } from "@/services/mercado.service";

import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";

// Types re-exported from service


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
    queryFn: () => mercadoService.fetchPrices(),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });


  const commodities = data?.commodities || [];
  const historico = data?.historico || {};
  const topCommodities = commodities.slice(0, 4);

  // Default to first commodity for chart
  const activeChart = selectedChart || commodities[0]?.nome || "";
  const activeHistorico = historico[activeChart] || [];

  return (
    <div className="mercado-scope space-y-8 font-finance [font-feature-settings:'ss01','cv11','tnum']">
      {/* Page header — consistent baseline alignment */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
            Mercado de Commodities
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Preços, tendências e recomendações de venda
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-end h-9"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Top metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCommodities.map((c, i) => (
              <MetricCard
                key={c.nome}
                icon={c.tipo === "positiva" ? TrendingUp : TrendingDown}
                title={c.nome.split(" (")[0]}
                value={formatBRL(parseFloat(c.preco))}
                change={`${c.variacao} esta semana`}
                changeType={c.tipo === "positiva" ? "positive" : "negative"}
                delay={i * 0.1}
              />
            ))}
          </section>

          {/* Commodity cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commodities.map((c, i) => (
              <motion.article
                key={c.nome}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-card rounded-2xl p-6 shadow-card border cursor-pointer transition-colors flex flex-col ${
                  activeChart === c.nome ? "border-primary" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedChart(c.nome)}
              >
                <header className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="text-sm font-semibold tracking-tight text-foreground leading-snug">
                    {c.nome}
                  </h4>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium font-numeric tabular-nums ${
                      c.tipo === "positiva" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {c.tipo === "positiva" ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {c.variacao}
                  </span>
                </header>
                <p className="text-2xl font-numeric font-semibold tabular-nums tracking-tight text-foreground">
                  {formatBRL(parseFloat(c.preco))}
                </p>
                <dl className="mt-5 pt-4 border-t border-border grid grid-cols-1 gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs text-muted-foreground">Tendência</dt>
                    <dd className="text-xs text-foreground font-medium text-right">{c.tendencia}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs text-muted-foreground">Previsão</dt>
                    <dd className="text-xs text-foreground font-medium text-right">{c.previsao}</dd>
                  </div>
                </dl>
              </motion.article>
            ))}
          </section>

          {/* Chart */}
          {activeHistorico.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border"
            >
              <header className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  Histórico — {activeChart}
                </h3>
                <span className="text-xs text-muted-foreground font-numeric tabular-nums">R$</span>
              </header>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={activeHistorico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="data" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "IBM Plex Mono" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "IBM Plex Mono" }} domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", fontFamily: "IBM Plex Sans" }} />
                  <Line type="monotone" dataKey="preco" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} name="Preço" />
                </LineChart>
              </ResponsiveContainer>
            </motion.section>
          )}

          {/* AI Recommendations */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border"
          >
            <header className="mb-5">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Recomendações de Venda (IA)
              </h3>
            </header>
            <ul className="space-y-3">
              {recomendacoes.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/20 transition-colors"
                >
                  <span
                    className={`shrink-0 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg ${urgColor[r.urgencia]}`}
                  >
                    {r.acao}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground leading-snug">{r.cultura}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        </>
      )}
    </div>
  );
}
