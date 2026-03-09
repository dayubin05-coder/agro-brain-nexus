import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, MoreVertical, Sprout, Ruler, Calendar, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroFarm from "@/assets/hero-farm.jpg";
import { FarmMap } from "@/components/FarmMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Fazendas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFarm, setNewFarm] = useState({
    nome: "",
    cidade: "",
    estado: "",
    area_total: "",
  });

  const { data: fazendas, isLoading } = useQuery({
    queryKey: ["fazendas"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("fazendas")
        .select(`
          *,
          talhoes (count)
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
  });

  const addFarmMutation = useMutation({
    mutationFn: async (farmData: typeof newFarm) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("fazendas").insert([
        {
          nome: farmData.nome,
          cidade: farmData.cidade,
          estado: farmData.estado,
          area_total: Number(farmData.area_total),
          user_id: userData.user.id,
        }
      ]).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fazendas"] });
      toast({
        title: "Fazenda adicionada",
        description: "A nova fazenda foi cadastrada com sucesso.",
      });
      setIsAddOpen(false);
      setNewFarm({ nome: "", cidade: "", estado: "", area_total: "" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    addFarmMutation.mutate(newFarm);
  };

  const statusColor: Record<string, string> = {
    "Em produção": "bg-success/10 text-success",
    "Preparação": "bg-warning/10 text-warning",
    "Colheita": "bg-info/10 text-info",
  };

  const areaTotal = fazendas?.reduce((acc, farm) => acc + Number(farm.area_total), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-48">
        <img src={heroFarm} alt="Vista aérea de fazenda" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-70" />
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary-foreground">Minhas Fazendas</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">
              {fazendas?.length || 0} {fazendas?.length === 1 ? 'propriedade' : 'propriedades'} · {areaTotal} ha totais
            </p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Nova Fazenda
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Fazenda</DialogTitle>
                <DialogDescription>
                  Preencha os dados da sua nova propriedade.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddFarm} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Fazenda</Label>
                  <Input 
                    id="nome" 
                    required 
                    value={newFarm.nome}
                    onChange={(e) => setNewFarm({...newFarm, nome: e.target.value})}
                    placeholder="Ex: Fazenda Santa Maria" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input 
                      id="cidade" 
                      value={newFarm.cidade}
                      onChange={(e) => setNewFarm({...newFarm, cidade: e.target.value})}
                      placeholder="Ex: Rio Verde" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input 
                      id="estado" 
                      value={newFarm.estado}
                      onChange={(e) => setNewFarm({...newFarm, estado: e.target.value})}
                      placeholder="Ex: GO" 
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area_total">Área Total (ha)</Label>
                  <Input 
                    id="area_total" 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={newFarm.area_total}
                    onChange={(e) => setNewFarm({...newFarm, area_total: e.target.value})}
                    placeholder="Ex: 2500" 
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={addFarmMutation.isPending}>
                    {addFarmMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Cadastrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : fazendas?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">Nenhuma fazenda cadastrada ainda.</p>
        </div>
      ) : (
        /* Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fazendas?.map((farm: any, i: number) => {
            const talhoesCount = farm.talhoes?.[0]?.count || 0;
            return (
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
                      {farm.cidade}{farm.cidade && farm.estado ? ` - ${farm.estado}` : farm.estado ? farm.estado : 'Localização não informada'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor["Preparação"]}`}>
                      Ativa
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
                      <p className="text-sm font-semibold text-foreground">{farm.area_total} ha</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Culturas</p>
                      <p className="text-sm font-semibold text-foreground">-</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Talhões</p>
                      <p className="text-sm font-semibold text-foreground">{talhoesCount}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
}
