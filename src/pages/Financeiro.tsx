import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

const fluxoCaixa = [
  { mes: "Jan", receitas: 420000, despesas: 280000 },
  { mes: "Fev", receitas: 380000, despesas: 310000 },
  { mes: "Mar", receitas: 510000, despesas: 290000 },
  { mes: "Abr", receitas: 350000, despesas: 320000 },
  { mes: "Mai", receitas: 600000, despesas: 340000 },
  { mes: "Jun", receitas: 720000, despesas: 360000 },
];

const custoPorCultura = [
  { cultura: "Soja", custo: 3200, receita: 5800 },
  { cultura: "Milho", custo: 2800, receita: 4200 },
  { cultura: "Algodão", custo: 4500, receita: 7200 },
  { cultura: "Café", custo: 5200, receita: 9800 },
];

const transacoes = [
  { desc: "Venda Soja - 500 ton", valor: "+ R$ 425.000", tipo: "receita", data: "05/03/2026" },
  { desc: "Compra fertilizante MAP", valor: "- R$ 78.500", tipo: "despesa", data: "03/03/2026" },
  { desc: "Venda Milho - 200 ton", valor: "+ R$ 156.000", tipo: "receita", data: "01/03/2026" },
  { desc: "Folha de pagamento", valor: "- R$ 65.000", tipo: "despesa", data: "28/02/2026" },
  { desc: "Combustível diesel", valor: "- R$ 32.400", tipo: "despesa", data: "25/02/2026" },
];

export default function Financeiro() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Gestão Financeira</h1>
        <p className="text-muted-foreground text-sm mt-1">Controle financeiro da sua operação agrícola</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Wallet} title="Saldo Atual" value="R$ 1.85M" change="+15% vs mês anterior" changeType="positive" delay={0} />
        <MetricCard icon={TrendingUp} title="Receitas (Mês)" value="R$ 720K" change="+20% vs previsão" changeType="positive" delay={0.1} />
        <MetricCard icon={TrendingDown} title="Despesas (Mês)" value="R$ 360K" change="-5% vs orçamento" changeType="positive" delay={0.2} />
        <MetricCard icon={DollarSign} title="Custo/ha" value="R$ 4.250" change="Dentro do esperado" changeType="neutral" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Fluxo de Caixa Mensal (R$)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fluxoCaixa}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="receitas" stroke="hsl(152, 60%, 40%)" fill="url(#receitaGrad)" strokeWidth={2} name="Receitas" />
              <Area type="monotone" dataKey="despesas" stroke="hsl(0, 72%, 51%)" fill="url(#despesaGrad)" strokeWidth={2} name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Últimas Transações</h3>
          <div className="space-y-3">
            {transacoes.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  t.tipo === "receita" ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  {t.tipo === "receita" ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.desc}</p>
                  <p className="text-xs text-muted-foreground">{t.data}</p>
                </div>
                <span className={`text-sm font-semibold ${
                  t.tipo === "receita" ? "text-success" : "text-destructive"
                }`}>
                  {t.valor}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cost per culture */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">Rentabilidade por Cultura (R$/ha)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={custoPorCultura}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
            <XAxis dataKey="cultura" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
            <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
            <Bar dataKey="custo" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Custo" opacity={0.7} />
            <Bar dataKey="receita" fill="hsl(152, 55%, 28%)" radius={[4, 4, 0, 0]} name="Receita" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
