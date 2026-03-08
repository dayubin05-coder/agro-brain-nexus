import { motion } from "framer-motion";
import {
  Truck, Wrench, Fuel, Clock, MapPin, Plus, AlertTriangle, CheckCircle, XCircle,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const maquinas = [
  { id: 1, nome: "Trator John Deere 8R 410", tipo: "Trator", status: "Operando", horasUso: 4520, combustivel: 78, proxManutencao: "350h", localizacao: "Talhão 3", imagem: "🚜" },
  { id: 2, nome: "Colheitadeira S790", tipo: "Colheitadeira", status: "Parada", horasUso: 2100, combustivel: 45, proxManutencao: "100h", localizacao: "Barracão", imagem: "🌾" },
  { id: 3, nome: "Pulverizador Jacto Uniport", tipo: "Pulverizador", status: "Operando", horasUso: 3200, combustivel: 62, proxManutencao: "200h", localizacao: "Talhão 7", imagem: "💨" },
  { id: 4, nome: "Trator Case IH Magnum 340", tipo: "Trator", status: "Manutenção", horasUso: 5800, combustivel: 30, proxManutencao: "Em manutenção", localizacao: "Oficina", imagem: "🚜" },
  { id: 5, nome: "Plantadeira John Deere DB60", tipo: "Implemento", status: "Parada", horasUso: 1800, combustivel: 0, proxManutencao: "500h", localizacao: "Barracão", imagem: "🌱" },
  { id: 6, nome: "Drone DJI Agras T40", tipo: "Drone", status: "Operando", horasUso: 320, combustivel: 85, proxManutencao: "50h", localizacao: "Talhão 12", imagem: "🛸" },
];

const consumoData = [
  { mes: "Jan", diesel: 12000, gasolina: 800 },
  { mes: "Fev", diesel: 15000, gasolina: 750 },
  { mes: "Mar", diesel: 18000, gasolina: 900 },
  { mes: "Abr", diesel: 14000, gasolina: 680 },
  { mes: "Mai", diesel: 11000, gasolina: 600 },
  { mes: "Jun", diesel: 9000, gasolina: 550 },
];

const manutencoes = [
  { maquina: "Trator Case IH Magnum 340", tipo: "Corretiva", desc: "Troca do turbo", data: "06/03/2026", status: "Em andamento" },
  { maquina: "Pulverizador Jacto Uniport", tipo: "Preventiva", desc: "Troca de filtros e óleo", data: "15/03/2026", status: "Agendada" },
  { maquina: "Trator John Deere 8R 410", tipo: "Preventiva", desc: "Revisão 5000h", data: "20/03/2026", status: "Agendada" },
  { maquina: "Colheitadeira S790", tipo: "Preventiva", desc: "Afiação das navalhas", data: "10/04/2026", status: "Agendada" },
];

const statusIcon: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Operando": { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  "Parada": { icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
  "Manutenção": { icon: Wrench, color: "text-warning", bg: "bg-warning/10" },
};

export default function Maquinas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Máquinas</h1>
          <p className="text-muted-foreground text-sm mt-1">Controle de equipamentos e manutenção</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Cadastrar Máquina
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Truck} title="Total de Máquinas" value="15" change="6 categorias" changeType="neutral" delay={0} />
        <MetricCard icon={CheckCircle} title="Em Operação" value="12" change="80% da frota" changeType="positive" delay={0.1} />
        <MetricCard icon={Fuel} title="Diesel (Mês)" value="18.000 L" change="+20% vs mês ant." changeType="negative" delay={0.2} />
        <MetricCard icon={Wrench} title="Manutenções" value="4" change="1 corretiva, 3 prev." changeType="neutral" delay={0.3} />
      </div>

      {/* Machine cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {maquinas.map((m, i) => {
          const st = statusIcon[m.status] || statusIcon["Parada"];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.imagem}</span>
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm">{m.nome}</h4>
                    <p className="text-xs text-muted-foreground">{m.tipo}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${st.bg} ${st.color}`}>
                  <st.icon className="w-3 h-3" />
                  {m.status}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{m.horasUso.toLocaleString()}h</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{m.localizacao}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="flex items-center gap-1 flex-1">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${m.combustivel > 50 ? 'bg-success' : m.combustivel > 20 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${m.combustivel}%` }} />
                    </div>
                    <span className="text-muted-foreground">{m.combustivel}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{m.proxManutencao}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fuel consumption */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Consumo de Combustível (L)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={consumoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="diesel" fill="hsl(40, 60%, 50%)" radius={[4, 4, 0, 0]} name="Diesel" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Maintenance schedule */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Agenda de Manutenção</h3>
          <div className="space-y-3">
            {manutencoes.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.status === "Em andamento" ? "bg-warning/10" : "bg-info/10"
                }`}>
                  <Wrench className={`w-4 h-4 ${m.status === "Em andamento" ? "text-warning" : "text-info"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{m.maquina}</p>
                  <p className="text-xs text-muted-foreground">{m.desc} · {m.tipo}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-foreground">{m.data}</p>
                  <p className={`text-xs ${m.status === "Em andamento" ? "text-warning" : "text-info"}`}>{m.status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
