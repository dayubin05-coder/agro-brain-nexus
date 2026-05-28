import { useState } from "react";
import { motion } from "framer-motion";
import { Bug, Shield, AlertTriangle, MapPin, Calendar, Plus, Loader2, Trash2, Pencil } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserFazendas } from "@/hooks/use-user-fazendas";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateBR } from "@/lib/formatters";

const sevColor: Record<string, string> = { alta: "bg-destructive/10 text-destructive", media: "bg-warning/10 text-warning", baixa: "bg-success/10 text-success" };
const emptyForm = { fazenda_id: "", nome: "", tipo: "praga", severidade: "media", cultura: "", area_afetada: "", recomendacao: "", data_deteccao: "", status: "ativa" };

export default function Pragas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData, fazendas } = useUserFazendas();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: ocorrencias, isLoading } = useQuery({
    queryKey: ["pragas-real"], enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase.from("pragas_ocorrencias" as any).select("*, fazendas!inner(user_id, nome), talhoes(nome)").eq("fazendas.user_id", userData!.id).order("data_deteccao", { ascending: false });
      if (error) throw error; return data as any[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const { error } = await supabase.from("pragas_ocorrencias" as any).insert([{
        fazenda_id: f.fazenda_id, nome: f.nome.trim(), tipo: f.tipo, severidade: f.severidade,
        cultura: f.cultura || null, area_afetada: f.area_afetada ? Number(f.area_afetada) : null,
        recomendacao: f.recomendacao || null, data_deteccao: f.data_deteccao || new Date().toISOString().split("T")[0], status: "ativa",
      }] as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pragas-real"] }); toast({ title: "Ocorrência registrada" }); setIsAddOpen(false); setForm(emptyForm); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("pragas_ocorrencias" as any).update({
        nome: item.nome.trim(), tipo: item.tipo, severidade: item.severidade, status: item.status,
        cultura: item.cultura || null, area_afetada: item.area_afetada ? Number(item.area_afetada) : null,
        recomendacao: item.recomendacao || null,
      } as any).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pragas-real"] }); toast({ title: "Ocorrência atualizada" }); setEditingItem(null); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("pragas_ocorrencias" as any).delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pragas-real"] }); toast({ title: "Ocorrência removida" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fazenda_id || !form.nome) { toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return; }
    addMutation.mutate(form);
  };
  const handleEditSubmit = (e: React.FormEvent) => { e.preventDefault(); updateMutation.mutate(editingItem); };
  const openEdit = (p: any) => {
    setEditingItem({
      id: p.id, nome: p.nome, tipo: p.tipo, severidade: p.severidade, status: p.status,
      cultura: p.cultura || "", area_afetada: p.area_afetada ? String(p.area_afetada) : "", recomendacao: p.recomendacao || "",
    });
  };

  const items = ocorrencias || [];
  const ativas = items.filter(i => i.status === "ativa").length;
  const severas = items.filter(i => i.severidade === "alta" && i.status === "ativa").length;

  const PestFormFields = ({ data, setData, showFazenda = false }: { data: any; setData: (d: any) => void; showFazenda?: boolean }) => (
    <>
      {showFazenda && (
        <div className="space-y-2">
          <Label>Fazenda *</Label>
          <Select value={data.fazenda_id} onValueChange={v => setData({ ...data, fazenda_id: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{fazendas.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Nome *</Label><Input value={data.nome} onChange={e => setData({ ...data, nome: e.target.value })} placeholder="Ex: Ferrugem Asiática" /></div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={data.tipo} onValueChange={v => setData({ ...data, tipo: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="praga">Praga</SelectItem><SelectItem value="doenca">Doença</SelectItem><SelectItem value="nutricional">Nutricional</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Severidade</Label>
          <Select value={data.severidade} onValueChange={v => setData({ ...data, severidade: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="alta">Alta</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Cultura</Label><Input value={data.cultura} onChange={e => setData({ ...data, cultura: e.target.value })} placeholder="Soja" /></div>
        <div className="space-y-2"><Label>Área (ha)</Label><Input type="number" min="0" value={data.area_afetada} onChange={e => setData({ ...data, area_afetada: e.target.value })} /></div>
      </div>
      {!showFazenda && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={data.status} onValueChange={v => setData({ ...data, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ativa">Ativa</SelectItem><SelectItem value="resolvida">Resolvida</SelectItem><SelectItem value="monitorando">Monitorando</SelectItem></SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2"><Label>Recomendação</Label><Textarea value={data.recomendacao} onChange={e => setData({ ...data, recomendacao: e.target.value })} placeholder="Descreva a recomendação..." /></div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pragas & Doenças</h1>
          <p className="text-muted-foreground text-sm mt-1">Detecção, monitoramento e controle fitossanitário</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nova Ocorrência
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Ocorrência</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <PestFormFields data={form} setData={setForm} showFazenda />
              <div className="space-y-2"><Label>Data de Detecção</Label><Input type="date" value={form.data_deteccao} onChange={e => setForm({ ...form, data_deteccao: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Ocorrência</DialogTitle></DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <PestFormFields data={editingItem} setData={setEditingItem} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Bug} title="Ocorrências Ativas" value={String(ativas)} change={severas > 0 ? `${severas} severas` : "Nenhuma severa"} changeType={severas > 0 ? "negative" : "positive"} delay={0} />
        <MetricCard icon={Shield} title="Total Registros" value={String(items.length)} change="Histórico completo" changeType="neutral" delay={0.1} />
        <MetricCard icon={AlertTriangle} title="Severidade Alta" value={String(severas)} change={severas > 0 ? "Ação urgente" : "Sem alertas"} changeType={severas > 0 ? "negative" : "positive"} delay={0.2} />
        <MetricCard icon={Bug} title="Resolvidas" value={String(items.filter(i => i.status === "resolvida").length)} change="Controle efetivo" changeType="positive" delay={0.3} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Bug className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Nenhuma ocorrência registrada. Registre a primeira!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-foreground">Ocorrências</h3>
          {items.map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.severidade === "alta" ? "bg-destructive/10" : p.severidade === "media" ? "bg-warning/10" : "bg-success/10"}`}>
                    <Bug className={`w-5 h-5 ${p.severidade === "alta" ? "text-destructive" : p.severidade === "media" ? "text-warning" : "text-success"}`} />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{p.nome}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{p.tipo} {p.cultura ? `· ${p.cultura}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${sevColor[p.severidade] || sevColor.media}`}>{p.severidade}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.status === "ativa" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>{p.status}</span>
                  <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteMutation.mutate(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                {p.talhoes?.nome && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {p.talhoes.nome}</div>}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> {formatDateBR(p.data_deteccao)}</div>
                {p.area_afetada && <div className="text-xs text-muted-foreground">{p.area_afetada} ha afetados</div>}
              </div>
              {p.recomendacao && <div className="p-3 rounded-lg bg-accent/50 text-xs text-accent-foreground"><strong>Recomendação:</strong> {p.recomendacao}</div>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
