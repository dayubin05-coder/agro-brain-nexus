import { motion } from "framer-motion";
import { Package, AlertTriangle, Plus, Search, Filter, ArrowDown, ArrowUp } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const categorias = ["Todos", "Sementes", "Fertilizantes", "Defensivos", "Combustível", "Peças"];

const itensEstoque = [
  { id: 1, nome: "Semente Soja TMG 2381", categoria: "Sementes", quantidade: 12000, unidade: "kg", minimo: 5000, valor: "R$ 180.000", ultimaEntrada: "10/02/2026", status: "normal" },
  { id: 2, nome: "MAP (Fosfato Monoamônico)", categoria: "Fertilizantes", quantidade: 2000, unidade: "kg", minimo: 5000, valor: "R$ 12.000", ultimaEntrada: "05/01/2026", status: "baixo" },
  { id: 3, nome: "Glifosato 480g/L", categoria: "Defensivos", quantidade: 800, unidade: "L", minimo: 200, valor: "R$ 24.000", ultimaEntrada: "15/02/2026", status: "normal" },
  { id: 4, nome: "Diesel S-10", categoria: "Combustível", quantidade: 5200, unidade: "L", minimo: 3000, valor: "R$ 33.800", ultimaEntrada: "08/03/2026", status: "normal" },
  { id: 5, nome: "KCl (Cloreto de Potássio)", categoria: "Fertilizantes", quantidade: 8500, unidade: "kg", minimo: 3000, valor: "R$ 42.500", ultimaEntrada: "20/01/2026", status: "normal" },
  { id: 6, nome: "Fungicida Opera Ultra", categoria: "Defensivos", quantidade: 120, unidade: "L", minimo: 150, valor: "R$ 18.600", ultimaEntrada: "01/02/2026", status: "baixo" },
  { id: 7, nome: "Semente Milho DKB 390", categoria: "Sementes", quantidade: 3500, unidade: "kg", minimo: 2000, valor: "R$ 87.500", ultimaEntrada: "18/02/2026", status: "normal" },
  { id: 8, nome: "Óleo lubrificante 15W40", categoria: "Peças", quantidade: 180, unidade: "L", minimo: 100, valor: "R$ 5.400", ultimaEntrada: "25/01/2026", status: "normal" },
  { id: 9, nome: "Ureia 46%", categoria: "Fertilizantes", quantidade: 1200, unidade: "kg", minimo: 4000, valor: "R$ 4.800", ultimaEntrada: "12/12/2025", status: "critico" },
  { id: 10, nome: "Inseticida Engeo Pleno S", categoria: "Defensivos", quantidade: 340, unidade: "L", minimo: 200, valor: "R$ 27.200", ultimaEntrada: "05/03/2026", status: "normal" },
];

const movimentacoes = [
  { tipo: "entrada", item: "Diesel S-10", qtd: "3.000 L", data: "08/03/2026" },
  { tipo: "saida", item: "Glifosato 480g/L", qtd: "200 L", data: "07/03/2026" },
  { tipo: "entrada", item: "Inseticida Engeo Pleno S", qtd: "200 L", data: "05/03/2026" },
  { tipo: "saida", item: "MAP", qtd: "1.500 kg", data: "04/03/2026" },
  { tipo: "saida", item: "Diesel S-10", qtd: "800 L", data: "03/03/2026" },
];

export default function Estoque() {
  const alertas = itensEstoque.filter(i => i.status !== "normal").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Estoque</h1>
          <p className="text-muted-foreground text-sm mt-1">Controle de insumos e materiais da fazenda</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Nova Entrada
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Package} title="Total de Itens" value="847" change="10 categorias" changeType="neutral" delay={0} />
        <MetricCard icon={AlertTriangle} title="Estoque Baixo" value={`${alertas} itens`} change="Ação necessária" changeType="negative" delay={0.1} />
        <MetricCard icon={Package} title="Valor Total" value="R$ 435K" change="Insumos em estoque" changeType="neutral" delay={0.2} />
        <MetricCard icon={Package} title="Movimentações" value="23" change="Últimos 30 dias" changeType="neutral" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">Inventário</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" placeholder="Buscar item..." className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-32" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoria</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantidade</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Valor</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {itensEstoque.map((item, i) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{item.nome}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.categoria}</td>
                    <td className="py-3 px-4 text-right text-foreground">{item.quantidade.toLocaleString()} {item.unidade}</td>
                    <td className="py-3 px-4 text-right text-foreground">{item.valor}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.status === "normal" ? "bg-success/10 text-success" :
                        item.status === "baixo" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {item.status === "normal" ? "Normal" : item.status === "baixo" ? "Baixo" : "Crítico"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent movements */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Movimentações Recentes</h3>
          <div className="space-y-3">
            {movimentacoes.map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.tipo === "entrada" ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  {m.tipo === "entrada" ? (
                    <ArrowDown className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowUp className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.item}</p>
                  <p className="text-xs text-muted-foreground">{m.data}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{m.qtd}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
