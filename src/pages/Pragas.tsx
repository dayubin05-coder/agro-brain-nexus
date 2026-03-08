import { motion } from "framer-motion";
import {
  Bug, Camera, Shield, AlertTriangle, MapPin, Calendar, ChevronRight, Scan,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

const pragasDetectadas = [
  {
    id: 1, nome: "Ferrugem Asiática", tipo: "Doença", severidade: "Alta",
    talhao: "Talhão 12", cultura: "Soja", dataDeteccao: "06/03/2026",
    area: "45 ha afetados", recomendacao: "Aplicação urgente de fungicida triazol + estrobilurina",
  },
  {
    id: 2, nome: "Percevejo Marrom", tipo: "Praga", severidade: "Média",
    talhao: "Talhão 3", cultura: "Soja", dataDeteccao: "05/03/2026",
    area: "20 ha afetados", recomendacao: "Monitorar nível populacional. Aplicar inseticida se >2/m linear",
  },
  {
    id: 3, nome: "Lagarta Helicoverpa", tipo: "Praga", severidade: "Alta",
    talhao: "Talhão 8", cultura: "Algodão", dataDeteccao: "04/03/2026",
    area: "80 ha afetados", recomendacao: "Aplicação de inseticida biológico + químico imediatamente",
  },
  {
    id: 4, nome: "Deficiência de Potássio", tipo: "Nutricional", severidade: "Média",
    talhao: "Talhão 5", cultura: "Milho", dataDeteccao: "03/03/2026",
    area: "30 ha afetados", recomendacao: "Adubação foliar com KCl. Análise de solo recomendada",
  },
];

const radarColetivo = [
  { regiao: "Luís Eduardo Magalhães - BA", praga: "Ferrugem Asiática", ocorrencias: 23, tendencia: "Aumentando" },
  { regiao: "Sorriso - MT", praga: "Percevejo Marrom", ocorrencias: 15, tendencia: "Estável" },
  { regiao: "Rio Verde - GO", praga: "Lagarta Helicoverpa", ocorrencias: 31, tendencia: "Aumentando" },
  { regiao: "Uberaba - MG", praga: "Bicho Mineiro", ocorrencias: 8, tendencia: "Diminuindo" },
];

const sevColor: Record<string, string> = {
  "Alta": "bg-destructive/10 text-destructive",
  "Média": "bg-warning/10 text-warning",
  "Baixa": "bg-success/10 text-success",
};

export default function Pragas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pragas & Doenças</h1>
          <p className="text-muted-foreground text-sm mt-1">Detecção, monitoramento e controle fitossanitário</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
          <Camera className="w-4 h-4" />
          Diagnóstico por Foto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Bug} title="Pragas Ativas" value="4" change="2 severas" changeType="negative" delay={0} />
        <MetricCard icon={Shield} title="Aplicações (Mês)" value="6" change="4 preventivas" changeType="neutral" delay={0.1} />
        <MetricCard icon={Scan} title="Área Monitorada" value="830 ha" change="100% da lavoura" changeType="positive" delay={0.2} />
        <MetricCard icon={AlertTriangle} title="Radar Regional" value="77" change="Ocorrências na região" changeType="negative" delay={0.3} />
      </div>

      {/* Detected pests */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-foreground">Ocorrências Ativas</h3>
        {pragasDetectadas.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  p.severidade === "Alta" ? "bg-destructive/10" : "bg-warning/10"
                }`}>
                  <Bug className={`w-5 h-5 ${p.severidade === "Alta" ? "text-destructive" : "text-warning"}`} />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">{p.nome}</h4>
                  <p className="text-xs text-muted-foreground">{p.tipo} · {p.cultura}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sevColor[p.severidade]}`}>
                {p.severidade}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {p.talhao}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /> {p.dataDeteccao}
              </div>
              <div className="text-xs text-muted-foreground col-span-2">{p.area}</div>
            </div>
            <div className="p-3 rounded-lg bg-accent/50 text-xs text-accent-foreground">
              <strong>Recomendação:</strong> {p.recomendacao}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Regional radar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">🛰️ Radar Coletivo de Pragas</h3>
        <p className="text-xs text-muted-foreground mb-4">Ocorrências reportadas por produtores da região</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Região</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Praga/Doença</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs">Ocorrências</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {radarColetivo.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 px-3 text-foreground">{r.regiao}</td>
                  <td className="py-3 px-3 text-foreground">{r.praga}</td>
                  <td className="py-3 px-3 text-center font-semibold text-foreground">{r.ocorrencias}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.tendencia === "Aumentando" ? "bg-destructive/10 text-destructive" :
                      r.tendencia === "Diminuindo" ? "bg-success/10 text-success" :
                      "bg-warning/10 text-warning"
                    }`}>
                      {r.tendencia}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
