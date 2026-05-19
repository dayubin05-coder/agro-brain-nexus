import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Package, Truck, Users, Search, Star, MapPin, Gavel, Plus, Loader2
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MetricCard from "@/components/MetricCard";

const categorias = ["Todos", "Venda", "Serviço", "Máquina", "Transporte", "Consultoria"];

const tipoColor: Record<string, string> = {
  "venda": "bg-success/10 text-success",
  "servico": "bg-info/10 text-info",
  "maquina": "bg-warning/10 text-warning",
  "transporte": "bg-purple-500/10 text-purple-500",
  "consultoria": "bg-blue-500/10 text-blue-500",
};

export default function Marketplace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Todos");

  const { data: anuncios, isLoading } = useQuery({
    queryKey: ["marketplace-anuncios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_anuncios")
        .select("*")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: minhasVendas } = useQuery({
    queryKey: ["minhas-vendas"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      const { data, error } = await supabase
        .from("marketplace_anuncios")
        .select("*, marketplace_propostas(id, valor, status)")
        .eq("user_id", userData.user.id);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Marketplace Agrícola</h1>
        <p className="text-muted-foreground text-sm mt-1">Compre insumos, venda produção e contrate serviços</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={ShoppingCart} title="Anúncios Ativos" value={anuncios?.length || 0} change="Na sua região" changeType="neutral" delay={0} />
        <MetricCard icon={Package} title="Suas Vendas" value={minhasVendas?.length || 0} change="Vendas ativas" changeType="positive" delay={0.1} />
        <MetricCard icon={Truck} title="Fretes" value="--" change="Disponíveis" changeType="neutral" delay={0.2} />
        <MetricCard icon={Users} title="Fornecedores" value="--" change="Verificados" changeType="neutral" delay={0.3} />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 p-4 bg-card rounded-xl shadow-card border border-border">
        <div className="flex items-center gap-3 flex-1 w-full">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Buscar insumos, serviços..." 
            className="flex-1 bg-transparent border-none focus-visible:ring-0" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categorias.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)} className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCat === c ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {minhasVendas && minhasVendas.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Minhas Ofertas
          </h3>
          <div className="space-y-3">
            {minhasVendas.map((v: any) => (
              <div key={v.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{v.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.marketplace_propostas?.length || 0} propostas recebidas
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  v.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>{v.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anuncios?.filter(a => {
            const matchesSearch = a.titulo.toLowerCase().includes(search.toLowerCase()) || a.descricao?.toLowerCase().includes(search.toLowerCase());
            const matchesCat = selectedCat === "Todos" || a.tipo.toLowerCase() === selectedCat.toLowerCase();
            return matchesSearch && matchesCat;
          }).map((a, i) => (
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
                  <Star className="w-3 h-3 fill-current" /> New
                </div>
              </div>
              <h4 className="font-display font-semibold text-foreground mt-2 group-hover:text-primary transition-colors">{a.titulo}</h4>
              <p className="text-xl font-display font-bold text-primary mt-2">{a.preco}</p>
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> {a.localizacao || "Região sob consulta"}
                </p>
                <Button className="w-full mt-2 gap-2" variant="outline" size="sm">
                  <Gavel className="w-4 h-4" /> Negociar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
