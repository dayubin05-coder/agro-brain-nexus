import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, MoreVertical, Sprout, Ruler, Calendar, Loader2, Pencil, Trash2, Layers } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroFarm from "@/assets/hero-farm.jpg";
import { FarmMap } from "@/components/FarmMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TalhoesManager from "@/components/TalhoesManager";

const emptyForm = { nome: "", cidade: "", estado: "", area_total: "" };

export default function Fazendas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any>(null);
  const [newFarm, setNewFarm] = useState(emptyForm);

  const { data: fazendas, isLoading } = useQuery({
    queryKey: ["fazendas"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("fazendas")
        .select(`*, talhoes (id, nome, area, coordenadas)`)
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
      const { error } = await supabase.from("fazendas").insert([{
        nome: farmData.nome, cidade: farmData.cidade, estado: farmData.estado,
        area_total: Number(farmData.area_total), user_id: userData.user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fazendas"] });
      toast({ title: "Fazenda adicionada", description: "A nova fazenda foi cadastrada com sucesso." });
      setIsAddOpen(false);
      setNewFarm(emptyForm);
    },
    onError: (error) => toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" }),
  });

  const updateFarmMutation = useMutation({
    mutationFn: async (farm: any) => {
      const { error } = await supabase.from("fazendas").update({
        nome: farm.nome, cidade: farm.cidade, estado: farm.estado,
        area_total: Number(farm.area_total),
      }).eq("id", farm.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fazendas"] });
      toast({ title: "Fazenda atualizada" });
      setEditingFarm(null);
    },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteFarmMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fazendas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fazendas"] });
      toast({ title: "Fazenda removida" });
    },
    onError: (e) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    addFarmMutation.mutate(newFarm);
  };

  const handleEditFarm = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarmMutation.mutate(editingFarm);
  };

  const openEdit = (farm: any) => {
    setEditingFarm({ id: farm.id, nome: farm.nome, cidade: farm.cidade || "", estado: farm.estado || "", area_total: String(farm.area_total) });
  };

  const statusColor: Record<string, string> = {
    "Em produção": "bg-success/10 text-success",
    "Preparação": "bg-warning/10 text-warning",
    "Colheita": "bg-info/10 text-info",
  };

  const areaTotal = fazendas?.reduce((acc, farm) => acc + Number(farm.area_total), 0) || 0;

  const FarmForm = ({ data, setData, onSubmit, isPending, submitLabel }: any) => (
    <form onSubmit={onSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Nome da Fazenda</Label>
        <Input required value={data.nome} onChange={(e) => setData({ ...data, nome: e.target.value })} placeholder="Ex: Fazenda Santa Maria" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input value={data.cidade} onChange={(e) => setData({ ...data, cidade: e.target.value })} placeholder="Ex: Rio Verde" />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Input value={data.estado} onChange={(e) => setData({ ...data, estado: e.target.value })} placeholder="Ex: GO" maxLength={2} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Área Total (ha)</Label>
        <Input type="number" required min="0" step="0.01" value={data.area_total} onChange={(e) => setData({ ...data, area_total: e.target.value })} placeholder="Ex: 2500" />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}{submitLabel}
        </Button>
      </div>
    </form>
  );

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
                <Plus className="w-4 h-4" /> Nova Fazenda
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Fazenda</DialogTitle>
                <DialogDescription>Preencha os dados da sua nova propriedade.</DialogDescription>
              </DialogHeader>
              <FarmForm data={newFarm} setData={setNewFarm} onSubmit={handleAddFarm} isPending={addFarmMutation.isPending} submitLabel="Cadastrar" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingFarm} onOpenChange={(o) => !o && setEditingFarm(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Fazenda</DialogTitle>
            <DialogDescription>Atualize os dados da propriedade.</DialogDescription>
          </DialogHeader>
          {editingFarm && (
            <FarmForm data={editingFarm} setData={setEditingFarm} onSubmit={handleEditFarm} isPending={updateFarmMutation.isPending} submitLabel="Salvar" />
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : fazendas?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">Nenhuma fazenda cadastrada ainda.</p>
        </div>
      ) : (
        <Tabs defaultValue="lista" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">Suas Propriedades</h2>
            <TabsList>
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="mapa">Mapa</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="lista" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fazendas?.map((farm: any, i: number) => {
                const talhoesCount = farm.talhoes?.length || 0;
                return (
                  <motion.div key={farm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow border border-border group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-lg">{farm.nome}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {farm.cidade}{farm.cidade && farm.estado ? ` - ${farm.estado}` : farm.estado ? farm.estado : 'Localização não informada'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor["Preparação"]}`}>Ativa</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(farm)}>
                              <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteFarmMutation.mutate(farm.id)}>
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="mapa" className="mt-0">
            <FarmMap fazendas={fazendas} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
