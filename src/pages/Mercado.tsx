import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3, Bell, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const commodities = [
  { nome: "Soja (sc 60kg)", preco: "R$ 142,50", variacao: "-2.1%", tipo: "negativa", tendencia: "Estável", previsao: "R$ 148 em 30 dias" },
  { nome: "Milho (sc 60kg)", preco: "R$ 72,30", variacao: "+1.8%", tipo: "positiva", tendencia: "Alta", previsao: "R$ 78 em 30 dias" },
  { nome: "Algodão (@)", preco: "R$ 135,00", variacao: "+3.2%", tipo: "positiva", tendencia: "Alta", previsao: "R$ 142 em 30 dias" },
  { nome: "Café (sc 60kg)", preco: "R$ 1.420", variacao: "+5.1%", tipo: "positiva", tendencia: "Alta forte", previsao: "R$ 1.500 em 30 dias" },
  { nome: "Boi Gordo (@)", preco: "R$ 315,00", variacao: "-0.5%", tipo: "negativa", tendencia: "Estável", previsao: "R$ 320 em 30 dias" },
];

const historicoSoja = [
  { data: "Out", preco: 138 }, { data: "Nov", preco: 142 }, { data: "Dez", preco: 148 },
  { data: "Jan", preco: 155 }, { data: "Fev", preco: 150 }, { data: "Mar", preco: 142 },
];

const historicoMilho = [
  { data: "Out", preco: 62 }, { data: "Nov", preco: 65 }, { data: "Dez", preco: 68 },
  { data: "Jan", preco: 70 }, { data: "Fev", preco: 71 }, { data: "Mar", preco: 72 },
];

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

export default function Mercado() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Mercado de Commodities</h1>
        <p className="text-muted-foreground text-sm mt-1">Preços, tendências e recomendações de venda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={DollarSign} title="Soja (sc)" value="R$ 142,50" change="-2.1% esta semana" changeType="negative" delay={0} />
        <MetricCard icon={TrendingUp} title="Milho (sc)" value="R$ 72,30" change="+1.8% esta semana" changeType="positive" delay={0.1} />
        <MetricCard icon={TrendingUp} title="Algodão (@)" value="R$ 135,00" change="+3.2% esta semana" changeType="positive" delay={0.2} />
        <MetricCard icon={TrendingUp} title="Café (sc)" value="R$ 1.420" change="+5.1% esta semana" changeType="positive" delay={0.3} />
      </div>

      {/* Commodity cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commodities.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-display font-semibold text-foreground">{c.nome}</h4>
              <span className={`flex items-center gap-1 text-xs font-medium ${c.tipo === "positiva" ? "text-success" : "text-destructive"}`}>
                {c.tipo === "positiva" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {c.variacao}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{c.preco}</p>
            <div className="mt-3 pt-3 border-t border-border space-y-1">
              <p className="text-xs text-muted-foreground">Tendência: <span className="text-foreground font-medium">{c.tendencia}</span></p>
              <p className="text-xs text-muted-foreground">Previsão: <span className="text-foreground font-medium">{c.previsao}</span></p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Histórico Soja (R$/sc)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={historicoSoja}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="preco" stroke="hsl(152, 55%, 28%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(152, 55%, 28%)" }} name="Preço" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Histórico Milho (R$/sc)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={historicoMilho}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="preco" stroke="hsl(40, 60%, 50%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(40, 60%, 50%)" }} name="Preço" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

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
    </div>
  );
}
