import { motion } from "framer-motion";
import {
  Sprout, DollarSign, TrendingUp, Truck, Package, Users, CloudSun,
  Bug, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import AlertCard from "@/components/AlertCard";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const productionData = [
  { mes: "Jan", soja: 120, milho: 80 },
  { mes: "Fev", soja: 140, milho: 95 },
  { mes: "Mar", soja: 160, milho: 110 },
  { mes: "Abr", soja: 180, milho: 125 },
  { mes: "Mai", soja: 200, milho: 140 },
  { mes: "Jun", soja: 190, milho: 135 },
];

const costData = [
  { categoria: "Sementes", valor: 45000 },
  { categoria: "Fertiliz.", valor: 78000 },
  { categoria: "Defensivos", valor: 52000 },
  { categoria: "Combustível", valor: 32000 },
  { categoria: "Mão de obra", valor: 65000 },
];

const cultureDistribution = [
  { name: "Soja", value: 45, color: "hsl(152, 55%, 28%)" },
  { name: "Milho", value: 30, color: "hsl(40, 60%, 50%)" },
  { name: "Algodão", value: 15, color: "hsl(200, 80%, 50%)" },
  { name: "Café", value: 10, color: "hsl(25, 70%, 40%)" },
];

const alerts = [
  { type: "praga" as const, title: "Ferrugem asiática detectada", description: "Talhão 12 - Soja | Nível de severidade alto", time: "2h atrás", severity: "alta" as const },
  { type: "clima" as const, title: "Previsão de geada", description: "Temperatura mínima prevista: -2°C para amanhã", time: "4h atrás", severity: "alta" as const },
  { type: "maquina" as const, title: "Manutenção preventiva", description: "Trator John Deere 8R - 500h de uso atingidas", time: "6h atrás", severity: "media" as const },
  { type: "geral" as const, title: "Estoque baixo de fertilizante", description: "MAP - Apenas 2 toneladas restantes", time: "1d atrás", severity: "media" as const },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da sua operação agrícola</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Sprout} title="Produção Estimada" value="4.850 ton" change="+12% vs safra anterior" changeType="positive" delay={0} />
        <MetricCard icon={DollarSign} title="Lucro Estimado" value="R$ 2.3M" change="+8.5% vs previsão" changeType="positive" delay={0.1} />
        <MetricCard icon={TrendingUp} title="Preço Soja (sc)" value="R$ 142,50" change="-2.1% esta semana" changeType="negative" delay={0.2} />
        <MetricCard icon={CloudSun} title="Clima Hoje" value="28°C" change="Parcialmente nublado" changeType="neutral" delay={0.3} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Production chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Produção por Mês (ton)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={productionData}>
              <defs>
                <linearGradient id="sojaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 55%, 28%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 55%, 28%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="milhoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(40, 60%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(40, 60%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip
                contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="soja" stroke="hsl(152, 55%, 28%)" fill="url(#sojaGrad)" strokeWidth={2} name="Soja" />
              <Area type="monotone" dataKey="milho" stroke="hsl(40, 60%, 50%)" fill="url(#milhoGrad)" strokeWidth={2} name="Milho" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Culture distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Distribuição de Culturas</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={cultureDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {cultureDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {cultureDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                {item.name} ({item.value}%)
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Costs + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Custos por Categoria (R$)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis dataKey="categoria" type="category" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} width={80} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="valor" fill="hsl(152, 55%, 28%)" radius={[0, 6, 6, 0]} name="Valor" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Alertas Recentes</h3>
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">4 alertas</span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <AlertCard key={i} {...alert} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick stats bottom */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard icon={Truck} title="Máquinas Ativas" value="12/15" change="3 em manutenção" changeType="neutral" delay={0.45} />
        <MetricCard icon={Package} title="Itens em Estoque" value="847" change="-5 itens baixos" changeType="negative" delay={0.5} />
        <MetricCard icon={Users} title="Funcionários" value="38" change="Todos ativos" changeType="positive" delay={0.55} />
        <MetricCard icon={Bug} title="Pragas Detectadas" value="2" change="Ação necessária" changeType="negative" delay={0.6} />
      </div>
    </div>
  );
}
