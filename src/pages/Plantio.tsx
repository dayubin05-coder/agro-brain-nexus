import { motion } from "framer-motion";
import { useState } from "react";
import {
  Sprout, Calendar, TrendingUp, Wheat, Plus, ChevronRight,
  Droplets, Sun, Thermometer, Leaf,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

const safras = [
  {
    id: 1, cultura: "Soja", variedade: "TMG 2381", talhao: "Talhão 1", area: "320 ha",
    dataPlantio: "15/10/2025", prevColheita: "20/02/2026", status: "Crescimento", progresso: 72,
    densidade: "14 sem/m", fertilizacao: "MAP 300kg/ha", defensivos: "2 aplicações",
  },
  {
    id: 2, cultura: "Milho Safrinha", variedade: "DKB 390", talhao: "Talhão 5", area: "180 ha",
    dataPlantio: "25/02/2026", prevColheita: "15/07/2026", status: "Plantio", progresso: 15,
    densidade: "3.5 sem/m", fertilizacao: "NPK 400kg/ha", defensivos: "0 aplicações",
  },
  {
    id: 3, cultura: "Algodão", variedade: "FM 985 GLTP", talhao: "Talhão 8", area: "250 ha",
    dataPlantio: "10/12/2025", prevColheita: "15/06/2026", status: "Floração", progresso: 55,
    densidade: "9 sem/m", fertilizacao: "KCl 200kg/ha", defensivos: "4 aplicações",
  },
  {
    id: 4, cultura: "Café", variedade: "Catuaí Vermelho", talhao: "Talhão 12", area: "80 ha",
    dataPlantio: "Perene", prevColheita: "Mai-Jul/2026", status: "Frutificação", progresso: 60,
    densidade: "4.000 pl/ha", fertilizacao: "Foliar + solo", defensivos: "3 aplicações",
  },
];

const produtividadeData = [
  { safra: "20/21", soja: 58, milho: 95, algodao: 280 },
  { safra: "21/22", soja: 62, milho: 102, algodao: 295 },
  { safra: "22/23", soja: 55, milho: 98, algodao: 270 },
  { safra: "23/24", soja: 64, milho: 110, algodao: 310 },
  { safra: "24/25", soja: 68, milho: 115, algodao: 320 },
  { safra: "25/26*", soja: 70, milho: 118, algodao: 330 },
];

const crescimentoData = [
  { semana: "S1", soja: 5, milho: 3 },
  { semana: "S2", soja: 12, milho: 8 },
  { semana: "S3", soja: 22, milho: 15 },
  { semana: "S4", soja: 35, milho: 25 },
  { semana: "S5", soja: 50, milho: 38 },
  { semana: "S6", soja: 65, milho: 52 },
  { semana: "S7", soja: 78, milho: 65 },
  { semana: "S8", soja: 88, milho: 75 },
];

const statusColor: Record<string, string> = {
  "Plantio": "bg-info/10 text-info",
  "Crescimento": "bg-success/10 text-success",
  "Floração": "bg-warning/10 text-warning",
  "Frutificação": "bg-secondary/10 text-secondary",
  "Colheita": "bg-primary/10 text-primary",
};

export default function Plantio() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Plantio & Colheita</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie o ciclo completo das suas culturas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Novo Plantio
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Sprout} title="Área Plantada" value="830 ha" change="Safra 2025/26" changeType="neutral" delay={0} />
        <MetricCard icon={Wheat} title="Prod. Estimada" value="4.850 ton" change="+12% vs anterior" changeType="positive" delay={0.1} />
        <MetricCard icon={Calendar} title="Próx. Colheita" value="20/02/2026" change="Soja - Talhão 1" changeType="neutral" delay={0.2} />
        <MetricCard icon={TrendingUp} title="Produtividade Méd." value="68 sc/ha" change="+6% vs safra ant." changeType="positive" delay={0.3} />
      </div>

      {/* Active plantings */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-foreground">Culturas Ativas</h3>
        {safras.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">{s.cultura} — {s.variedade}</h4>
                  <p className="text-xs text-muted-foreground">{s.talhao} · {s.area}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[s.status] || "bg-muted text-muted-foreground"}`}>
                  {s.status}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Plantio</p>
                <p className="font-medium text-foreground">{s.dataPlantio}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Prev. Colheita</p>
                <p className="font-medium text-foreground">{s.prevColheita}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Densidade</p>
                <p className="font-medium text-foreground">{s.densidade}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Fertilização</p>
                <p className="font-medium text-foreground">{s.fertilizacao}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Progresso</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${s.progresso}%` }} />
                  </div>
                  <span className="font-medium text-foreground text-xs">{s.progresso}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Produtividade por Safra (sc/ha)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={produtividadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="safra" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="soja" fill="hsl(152, 55%, 28%)" radius={[4, 4, 0, 0]} name="Soja" />
              <Bar dataKey="milho" fill="hsl(40, 60%, 50%)" radius={[4, 4, 0, 0]} name="Milho" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Crescimento da Lavoura (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={crescimentoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="soja" stroke="hsl(152, 55%, 28%)" strokeWidth={2} dot={false} name="Soja" />
              <Line type="monotone" dataKey="milho" stroke="hsl(40, 60%, 50%)" strokeWidth={2} dot={false} name="Milho" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
