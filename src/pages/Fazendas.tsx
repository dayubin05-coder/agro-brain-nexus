import { motion } from "framer-motion";
import { MapPin, Plus, MoreVertical, Sprout, Ruler, Calendar } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";

const fazendas = [
  {
    id: 1,
    nome: "Fazenda Santa Maria",
    cidade: "Luís Eduardo Magalhães - BA",
    area: "2.500 ha",
    talhoes: 18,
    culturaAtual: "Soja",
    safra: "2025/2026",
    status: "Em produção",
  },
  {
    id: 2,
    nome: "Fazenda Boa Vista",
    cidade: "Sorriso - MT",
    area: "4.200 ha",
    talhoes: 32,
    culturaAtual: "Milho safrinha",
    safra: "2025/2026",
    status: "Em produção",
  },
  {
    id: 3,
    nome: "Fazenda São João",
    cidade: "Rio Verde - GO",
    area: "1.800 ha",
    talhoes: 12,
    culturaAtual: "Algodão",
    safra: "2025/2026",
    status: "Preparação",
  },
  {
    id: 4,
    nome: "Fazenda Nova Esperança",
    cidade: "Uberaba - MG",
    area: "3.100 ha",
    talhoes: 24,
    culturaAtual: "Café",
    safra: "2025/2026",
    status: "Colheita",
  },
];

const statusColor: Record<string, string> = {
  "Em produção": "bg-success/10 text-success",
  "Preparação": "bg-warning/10 text-warning",
  "Colheita": "bg-info/10 text-info",
};

export default function Fazendas() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-48">
        <img src={heroFarm} alt="Vista aérea de fazenda" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-70" />
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary-foreground">Minhas Fazendas</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">4 propriedades · 11.600 ha totais</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Nova Fazenda
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fazendas.map((farm, i) => (
          <motion.div
            key={farm.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow border border-border group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-foreground text-lg">{farm.nome}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {farm.cidade}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[farm.status] || "bg-muted text-muted-foreground"}`}>
                  {farm.status}
                </span>
                <button className="p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Área</p>
                  <p className="text-sm font-semibold text-foreground">{farm.area}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cultura</p>
                  <p className="text-sm font-semibold text-foreground">{farm.culturaAtual}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Talhões</p>
                  <p className="text-sm font-semibold text-foreground">{farm.talhoes}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
