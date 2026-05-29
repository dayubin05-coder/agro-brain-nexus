import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Calendar, TrendingUp, Wheat, Plus, Leaf, Loader2, Trash2, Pencil } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plantiosService } from "@/services/plantios.service";
import { culturasService } from "@/services/culturas.service";
import { talhoesService } from "@/services/talhoes.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useCurrentUser } from "@/hooks/use-current-user";

const produtividadeData = [
  { safra: "20/21", soja: 58, milho: 95 }, { safra: "21/22", soja: 62, milho: 102 },
  { safra: "22/23", soja: 55, milho: 98 }, { safra: "23/24", soja: 64, milho: 110 },
  { safra: "24/25", soja: 68, milho: 115 }, { safra: "25/26*", soja: 70, milho: 118 },
];
const crescimentoData = [
  { semana: "S1", soja: 5, milho: 3 }, { semana: "S2", soja: 12, milho: 8 },
  { semana: "S3", soja: 22, milho: 15 }, { semana: "S4", soja: 35, milho: 25 },
  { semana: "S5", soja: 50, milho: 38 }, { semana: "S6", soja: 65, milho: 52 },
  { semana: "S7", soja: 78, milho: 65 }, { semana: "S8", soja: 88, milho: 75 },
];
const statusColor: Record<string, string> = {
  plantio: "bg-info/10 text-info", crescimento: "bg-success/10 text-success",
  floracao: "bg-warning/10 text-warning", frutificacao: "bg-secondary/10 text-secondary", colheita: "bg-primary/10 text-primary",
};

const emptyForm = { cultura_id: "", talhao_id: "", area_plantada: "", data_plantio: "", previsao_colheita: "", variedade: "", densidade_plantio: "", fertilizacao: "", status: "plantio", progresso_percentual: "0" };

export default function Plantio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newPlantio, setNewPlantio] = useState(emptyForm);

  const { data: userData } = useCurrentUser();
  const { data: culturas } = useQuery({ queryKey: ["culturas"], queryFn: async () => { const { data, error } = await supabase.from("culturas").select("*").order("nome"); if (error) throw error; return data; } });
  const { data: talhoes } = useQuery({
    queryKey: ["talhoes-disponiveis"], enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase.from("talhoes").select("id, nome, area, fazendas (nome, user_id)").eq("fazendas.user_id", userData?.id);
      if (error) throw error; return data.filter(t => t.fazendas !== null);
    },
  });
  const { data: plantios, isLoading } = useQuery({
    queryKey: ["plantios"], enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase.from("plantios").select("*, culturas (nome), talhoes!inner (nome, fazendas!inner (user_id))").eq("talhoes.fazendas.user_id", userData?.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const addPlantioMutation = useMutation({
    mutationFn: async (p: typeof newPlantio) => {
      const { error } = await supabase.from("plantios").insert([{
        cultura_id: p.cultura_id, talhao_id: p.talhao_id, area_plantada: Number(p.area_plantada),
        data_plantio: p.data_plantio, previsao_colheita: p.previsao_colheita || null,
        variedade: p.variedade || null, densidade_plantio: p.densidade_plantio || null,
        fertilizacao: p.fertilizacao || null, status: "plantio", progresso_percentual: 0,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plantios"] }); toast({ title: "Plantio registrado" }); setIsAddOpen(false); setNewPlantio(emptyForm); },
    onError: (error) => toast({ title: "Erro ao registrar", description: error.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("plantios").update({
        variedade: item.variedade || null, densidade_plantio: item.densidade_plantio || null,
        fertilizacao: item.fertilizacao || null, previsao_colheita: item.previsao_colheita || null,
        status: item.status, progresso_percentual: Number(item.progresso_percentual) || 0,
      }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plantios"] }); toast({ title: "Plantio atualizado" }); setEditingItem(null); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("plantios").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plantios"] }); toast({ title: "Plantio removido" }); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const handleAddPlantio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantio.cultura_id || !newPlantio.talhao_id || !newPlantio.area_plantada || !newPlantio.data_plantio) { toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return; }
    addPlantioMutation.mutate(newPlantio);
  };
  const handleEditSubmit = (e: React.FormEvent) => { e.preventDefault(); updateMutation.mutate(editingItem); };
  const openEdit = (p: any) => {
    setEditingItem({
      id: p.id, variedade: p.variedade || "", densidade_plantio: p.densidade_plantio || "",
      fertilizacao: p.fertilizacao || "", previsao_colheita: p.previsao_colheita || "",
      status: p.status || "plantio", progresso_percentual: String(p.progresso_percentual || 0),
    });
  };

  const areaTotal = plantios?.reduce((acc, p) => acc + Number(p.area_plantada), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Plantio & Colheita</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie o ciclo completo das suas culturas</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Novo Plantio
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader><DialogTitle>Registrar Novo Plantio</DialogTitle><DialogDescription>Insira as informações do novo ciclo de cultivo.</DialogDescription></DialogHeader>
            <form onSubmit={handleAddPlantio} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cultura *</Label>
                  <Select value={newPlantio.cultura_id} onValueChange={val => setNewPlantio({ ...newPlantio, cultura_id: val })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{culturas?.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Variedade</Label><Input value={newPlantio.variedade} onChange={e => setNewPlantio({ ...newPlantio, variedade: e.target.value })} placeholder="Ex: TMG 2381" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Talhão *</Label>
                  <Select value={newPlantio.talhao_id} onValueChange={val => { const t = talhoes?.find(t => t.id === val); setNewPlantio({ ...newPlantio, talhao_id: val, area_plantada: t ? String(t.area) : newPlantio.area_plantada }); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{talhoes?.map(t => <SelectItem key={t.id} value={t.id}>{t.nome} ({t.fazendas?.nome})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Área (ha) *</Label><Input type="number" min="0" step="0.01" required value={newPlantio.area_plantada} onChange={e => setNewPlantio({ ...newPlantio, area_plantada: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Data de Plantio *</Label><Input type="date" required value={newPlantio.data_plantio} onChange={e => setNewPlantio({ ...newPlantio, data_plantio: e.target.value })} /></div>
                <div className="space-y-2"><Label>Previsão de Colheita</Label><Input type="date" value={newPlantio.previsao_colheita} onChange={e => setNewPlantio({ ...newPlantio, previsao_colheita: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Densidade</Label><Input value={newPlantio.densidade_plantio} onChange={e => setNewPlantio({ ...newPlantio, densidade_plantio: e.target.value })} placeholder="Ex: 14 sem/m" /></div>
                <div className="space-y-2"><Label>Fertilização</Label><Input value={newPlantio.fertilizacao} onChange={e => setNewPlantio({ ...newPlantio, fertilizacao: e.target.value })} placeholder="Ex: MAP 300kg/ha" /></div>
              </div>
              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={addPlantioMutation.isPending}>{addPlantioMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Plantio</DialogTitle></DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Variedade</Label><Input value={editingItem.variedade} onChange={e => setEditingItem({ ...editingItem, variedade: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editingItem.status} onValueChange={v => setEditingItem({ ...editingItem, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plantio">Plantio</SelectItem><SelectItem value="crescimento">Crescimento</SelectItem>
                      <SelectItem value="floracao">Floração</SelectItem><SelectItem value="frutificacao">Frutificação</SelectItem><SelectItem value="colheita">Colheita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Progresso (%)</Label><Input type="number" min="0" max="100" value={editingItem.progresso_percentual} onChange={e => setEditingItem({ ...editingItem, progresso_percentual: e.target.value })} /></div>
                <div className="space-y-2"><Label>Prev. Colheita</Label><Input type="date" value={editingItem.previsao_colheita} onChange={e => setEditingItem({ ...editingItem, previsao_colheita: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Densidade</Label><Input value={editingItem.densidade_plantio} onChange={e => setEditingItem({ ...editingItem, densidade_plantio: e.target.value })} /></div>
                <div className="space-y-2"><Label>Fertilização</Label><Input value={editingItem.fertilizacao} onChange={e => setEditingItem({ ...editingItem, fertilizacao: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Sprout} title="Área Plantada" value={`${areaTotal.toFixed(2)} ha`} change="Total em produção" changeType="neutral" delay={0} />
        <MetricCard icon={Wheat} title="Prod. Estimada" value="-" change="Calculando..." changeType="neutral" delay={0.1} />
        <MetricCard icon={Calendar} title="Plantios Ativos" value={plantios?.length?.toString() || "0"} change="Em andamento" changeType="neutral" delay={0.2} />
        <MetricCard icon={TrendingUp} title="Produtividade Méd." value="-" change="Aguardando colheita" changeType="neutral" delay={0.3} />
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-semibold text-foreground">Culturas Ativas</h3>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : plantios?.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border"><p className="text-muted-foreground">Nenhum plantio registrado ainda.</p></div>
        ) : (
          plantios?.map((p: any, i: number) => {
            const statusKey = p.status?.toLowerCase() || 'plantio';
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><Leaf className="w-5 h-5 text-accent-foreground" /></div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground">{p.culturas?.nome} {p.variedade ? `— ${p.variedade}` : ''}</h4>
                      <p className="text-xs text-muted-foreground">{p.talhoes?.nome} · {p.area_plantada} ha</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[statusKey] || "bg-muted text-muted-foreground"}`}>{p.status || 'Plantio'}</span>
                    <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteMutation.mutate(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                  <div><p className="text-muted-foreground text-xs">Plantio</p><p className="font-medium text-foreground">{p.data_plantio ? format(new Date(p.data_plantio), 'dd/MM/yyyy') : '-'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Prev. Colheita</p><p className="font-medium text-foreground">{p.previsao_colheita ? format(new Date(p.previsao_colheita), 'dd/MM/yyyy') : '-'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Densidade</p><p className="font-medium text-foreground">{p.densidade_plantio || '-'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Fertilização</p><p className="font-medium text-foreground">{p.fertilizacao || '-'}</p></div>
                  <div>
                    <p className="text-muted-foreground text-xs">Progresso</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.progresso_percentual || 0}%` }} /></div>
                      <span className="font-medium text-foreground text-xs">{p.progresso_percentual || 0}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Crescimento das Culturas (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={crescimentoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="soja" stroke="hsl(152, 55%, 28%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(152, 55%, 28%)" }} name="Soja" />
              <Line type="monotone" dataKey="milho" stroke="hsl(40, 60%, 50%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(40, 60%, 50%)" }} name="Milho" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
