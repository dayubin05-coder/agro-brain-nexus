import { motion } from "framer-motion";
import {
  ShoppingCart, Package, Truck, Users, Search, Star, MapPin, Phone, Filter,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

const categorias = ["Todos", "Insumos", "Serviços", "Máquinas", "Transporte", "Consultoria"];

const anuncios = [
  {
    id: 1, tipo: "Venda", titulo: "MAP Fosfato Monoamônico - 25 ton",
    vendedor: "Distribuidora AgroFert", local: "Luís Eduardo Magalhães - BA",
    preco: "R$ 3.200/ton", categoria: "Insumos", avaliacao: 4.8, negociacoes: 12,
  },
  {
    id: 2, tipo: "Serviço", titulo: "Pulverização Aérea - Asa Fixa",
    vendedor: "AeroAgro Aviação", local: "Sorriso - MT",
    preco: "R$ 45/ha", categoria: "Serviços", avaliacao: 4.9, negociacoes: 34,
  },
  {
    id: 3, tipo: "Venda", titulo: "Semente Soja TMG 2381 - Certificada",
    vendedor: "Sementes Brasil", local: "Rondonópolis - MT",
    preco: "R$ 280/sc", categoria: "Insumos", avaliacao: 4.7, negociacoes: 8,
  },
  {
    id: 4, tipo: "Serviço", titulo: "Transporte de Grãos - Sorriso/Santos",
    vendedor: "TransLog Agro", local: "Sorriso - MT",
    preco: "R$ 320/ton", categoria: "Transporte", avaliacao: 4.5, negociacoes: 45,
  },
  {
    id: 5, tipo: "Serviço", titulo: "Consultoria Agronômica - Pacote Safra",
    vendedor: "Dra. Maria Santos - CREA 12345", local: "Goiânia - GO",
    preco: "R$ 15.000/safra", categoria: "Consultoria", avaliacao: 5.0, negociacoes: 6,
  },
  {
    id: 6, tipo: "Venda", titulo: "Trator John Deere 6130J - 2022 (Usado)",
    vendedor: "JD Revendas", local: "Uberlândia - MG",
    preco: "R$ 420.000", categoria: "Máquinas", avaliacao: 4.6, negociacoes: 3,
  },
];

const minhasVendas = [
  { produto: "Soja Grão - 500 ton", status: "Oferta ativa", propostas: 3, melhorOferta: "R$ 142,50/sc" },
  { produto: "Milho Grão - 200 ton", status: "Em negociação", propostas: 5, melhorOferta: "R$ 73,00/sc" },
];

const tipoColor: Record<string, string> = {
  "Venda": "bg-success/10 text-success",
  "Serviço": "bg-info/10 text-info",
};

export default function Marketplace() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Marketplace Agrícola</h1>
        <p className="text-muted-foreground text-sm mt-1">Compre insumos, venda produção e contrate serviços</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={ShoppingCart} title="Anúncios Ativos" value="1.245" change="Na sua região" changeType="neutral" delay={0} />
        <MetricCard icon={Package} title="Suas Vendas" value="2" change="8 propostas recebidas" changeType="positive" delay={0.1} />
        <MetricCard icon={Truck} title="Fretes Disponíveis" value="38" change="Melhores preços" changeType="neutral" delay={0.2} />
        <MetricCard icon={Users} title="Fornecedores" value="320" change="Verificados" changeType="neutral" delay={0.3} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-card border border-border">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="Buscar insumos, serviços, máquinas..." className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none" />
        <div className="flex gap-2">
          {categorias.map(c => (
            <button key={c} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              c === "Todos" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* My sales */}
      {minhasVendas.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Minhas Ofertas de Venda</h3>
          <div className="space-y-3">
            {minhasVendas.map((v, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{v.produto}</p>
                  <p className="text-xs text-muted-foreground">{v.propostas} propostas · Melhor: {v.melhorOferta}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  v.status === "Oferta ativa" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>{v.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {anuncios.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${tipoColor[a.tipo]}`}>{a.tipo}</span>
              <div className="flex items-center gap-1 text-xs text-warning">
                <Star className="w-3 h-3 fill-current" /> {a.avaliacao}
              </div>
            </div>
            <h4 className="font-display font-semibold text-foreground mt-2 group-hover:text-primary transition-colors">{a.titulo}</h4>
            <p className="text-xl font-display font-bold text-primary mt-2">{a.preco}</p>
            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3 h-3" /> {a.vendedor}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> {a.local}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
