import { motion } from "framer-motion";
import {
  CloudSun, Droplets, Wind, Thermometer, Sun, CloudRain, Snowflake,
  AlertTriangle, Eye,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const previsao7dias = [
  { dia: "Seg", max: 32, min: 20, chuva: 0, icone: "☀️" },
  { dia: "Ter", max: 33, min: 21, chuva: 10, icone: "⛅" },
  { dia: "Qua", max: 30, min: 22, chuva: 60, icone: "🌧️" },
  { dia: "Qui", max: 28, min: 20, chuva: 80, icone: "⛈️" },
  { dia: "Sex", max: 27, min: 19, chuva: 40, icone: "🌦️" },
  { dia: "Sáb", max: 29, min: 18, chuva: 5, icone: "☀️" },
  { dia: "Dom", max: 31, min: 19, chuva: 0, icone: "☀️" },
];

const precipitacaoMensal = [
  { mes: "Out", valor: 120 },
  { mes: "Nov", valor: 180 },
  { mes: "Dez", valor: 220 },
  { mes: "Jan", valor: 280 },
  { mes: "Fev", valor: 210 },
  { mes: "Mar", valor: 160 },
];

const temperaturaData = [
  { hora: "06h", temp: 18 },
  { hora: "08h", temp: 22 },
  { hora: "10h", temp: 26 },
  { hora: "12h", temp: 30 },
  { hora: "14h", temp: 32 },
  { hora: "16h", temp: 30 },
  { hora: "18h", temp: 26 },
  { hora: "20h", temp: 22 },
];

const alertasClimaticos = [
  { tipo: "Chuva forte", desc: "Previsão de 60mm para quarta-feira. Possibilidade de alagamento em áreas baixas.", severidade: "alta", data: "12/03" },
  { tipo: "Previsão de geada", desc: "Frente fria na próxima semana. Mínima de 2°C prevista para região sul da fazenda.", severidade: "alta", data: "18/03" },
  { tipo: "Veranico", desc: "Período de estiagem previsto para final de março. 10-15 dias sem chuva significativa.", severidade: "media", data: "25/03" },
];

export default function Clima() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Monitoramento Climático</h1>
        <p className="text-muted-foreground text-sm mt-1">Previsão do tempo e alertas para sua fazenda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Thermometer} title="Temperatura Atual" value="28°C" change="Máx: 32°C / Mín: 20°C" changeType="neutral" delay={0} />
        <MetricCard icon={Droplets} title="Umidade do Ar" value="65%" change="Ideal para pulverização" changeType="positive" delay={0.1} />
        <MetricCard icon={Wind} title="Vento" value="12 km/h" change="Direção: Sudeste" changeType="neutral" delay={0.2} />
        <MetricCard icon={CloudRain} title="Chuva Acumulada" value="45 mm" change="Últimos 7 dias" changeType="neutral" delay={0.3} />
      </div>

      {/* 7-day forecast */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Previsão 7 Dias</h3>
        <div className="grid grid-cols-7 gap-3">
          {previsao7dias.map((d, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
              <p className="text-sm font-medium text-foreground">{d.dia}</p>
              <p className="text-3xl my-2">{d.icone}</p>
              <p className="text-sm font-display font-bold text-foreground">{d.max}°</p>
              <p className="text-xs text-muted-foreground">{d.min}°</p>
              {d.chuva > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-info">
                  <Droplets className="w-3 h-3" /> {d.chuva}%
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Temperatura Hoje (°C)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={temperaturaData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="temp" stroke="hsl(0, 72%, 51%)" fill="url(#tempGrad)" strokeWidth={2} name="Temp." />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rainfall chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Precipitação Mensal (mm)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={precipitacaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="valor" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} name="Precipitação" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Climate alerts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Alertas Climáticos</h3>
          <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">{alertasClimaticos.length} alertas</span>
        </div>
        <div className="space-y-3">
          {alertasClimaticos.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
              a.severidade === "alta" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                a.severidade === "alta" ? "bg-destructive/10" : "bg-warning/10"
              }`}>
                <AlertTriangle className={`w-4 h-4 ${a.severidade === "alta" ? "text-destructive" : "text-warning"}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{a.tipo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{a.data}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
