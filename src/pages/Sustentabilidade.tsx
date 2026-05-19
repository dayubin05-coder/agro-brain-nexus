import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserFazendas } from "@/hooks/use-user-fazendas";
import { Leaf, Droplets, Zap, Recycle, Plus, Loader2, TrendingUp, TrendingDown, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CATEGORIAS = [
  { value: "ambiental", label: "Ambiental", icon: Leaf, color: "text-success" },
  { value: "social", label: "Social", icon: Droplets, color: "text-info" },
  { value: "governanca", label: "Governança", icon: Zap, color: "text-warning" },
];

const INDICADORES_SUGERIDOS: Record<string, { nome: string; unidade: string }[]> = {
  ambiental: [
    { nome: "Emissão de CO₂", unidade: "tCO₂e" }, { nome: "Consumo de Água", unidade: "m³" },
    { nome: "Área de Preservação Permanente", unidade: "ha" }, { nome: "Reserva Legal", unidade: "ha" },
    { nome: "Resíduos Reciclados", unidade: "kg" }, { nome: "Uso de Energia Renovável", unidade: "kWh" },
  ],
  social: [
    { nome: "Funcionários com EPI", unidade: "%" }, { nome: "Treinamentos Realizados", unidade: "un" },
    { nome: "Acidentes de Trabalho", unidade: "un" }, { nome: "Horas de Capacitação", unidade: "h" },
  ],
  governanca: [
    { nome: "Conformidade Legal", unidade: "%" }, { nome: "Certificações Obtidas", unidade: "un" },
    { nome: "Auditorias Realizadas", unidade: "un" }, { nome: "CAR Ativo", unidade: "%" },
  ],
};

const PIE_COLORS = ["hsl(var(--success))", "hsl(var(--info))", "hsl(var(--warning))"];
const emptyForm = { fazenda_id: "", categoria: "ambiental", indicador: "", valor: "", unidade: "", meta: "", observacoes: "" };

export default function Sustentabilidade() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fazendas } = useUserFazendas();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: registros, isLoading } = useQuery({
    queryKey: ["sustentabilidade"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sustentabilidade_registros")
        .select("*, fazendas(nome)")
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const { error } = await supabase.from("sustentabilidade_registros").insert([{
        fazenda_id: formData.fazenda_id, categoria: formData.categoria, indicador: formData.indicador,
        valor: Number(formData.valor), unidade: formData.unidade, meta: formData.meta ? Number(formData.meta) : null, observacoes: formData.observacoes || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sustentabilidade"] }); toast({ title: "Registro adicionado" }); setIsAddOpen(false); setForm(emptyForm); },
    onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("sustentabilidade_registros").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sustentabilidade"] }); toast({ title: "Registro removido" }); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addMutation.mutate(form); };
  const handleIndicadorSelect = (indicador: string) => {
    const sugestao = INDICADORES_SUGERIDOS[form.categoria]?.find(i => i.nome === indicador);
    setForm({ ...form, indicador, unidade: sugestao?.unidade || form.unidade });
  };

  const byCategoria = CATEGORIAS.map(cat => ({ name: cat.label, value: registros?.filter((r: any) => r.categoria === cat.value).length || 0 }));
  const comMeta = registros?.filter((r: any) => r.meta && r.meta > 0) || [];
  const atingiramMeta = comMeta.filter((r: any) => r.valor >= r.meta);
  const percentualMeta = comMeta.length > 0 ? Math.round((atingiramMeta.length / comMeta.length) * 100) : 0;
  const topIndicadores = registros?.reduce((acc: any[], r: any) => {
    const existing = acc.find(a => a.indicador === r.indicador);
    if (existing) { existing.total += Number(r.valor); existing.count++; } else acc.push({ indicador: r.indicador, total: Number(r.valor), count: 1 });
    return acc;
  }, [])?.sort((a: any, b: any) => b.count - a.count)?.slice(0, 6) || [];

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-r from-success/20 via-info/10 to-warning/10">
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div>
            <div className="flex items-center gap-2 mb-2"><Recycle className="w-6 h-6 text-success" /><h1 className="text-2xl font-display font-bold text-foreground">Sustentabilidade & ESG</h1></div>
            <p className="text-muted-foreground text-sm max-w-md">Monitore indicadores ambientais, sociais e de governança.</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Novo Registro</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>Novo Indicador ESG</DialogTitle><DialogDescription>Registre um indicador de sustentabilidade.</DialogDescription></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Fazenda</Label>
                  <Select value={form.fazenda_id} onValueChange={v => setForm({ ...form, fazenda_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{fazendas?.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v, indicador: "", unidade: "" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Indicador</Label>
                    <Select value={form.indicador} onValueChange={handleIndicadorSelect}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{INDICADORES_SUGERIDOS[form.categoria]?.map(ind => <SelectItem key={ind.nome} value={ind.nome}>{ind.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Valor</Label><Input type="number" step="0.01" required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Unidade</Label><Input value={form.unidade} onChange={e => setForm({ ...form, unidade: e.target.value })} placeholder="ha, kg, %" /></div>
                  <div className="space-y-2"><Label>Meta</Label><Input type="number" step="0.01" value={form.meta} onChange={e => setForm({ ...form, meta: e.target.value })} placeholder="Opcional" /></div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><Leaf className="w-5 h-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Total Registros</p><p className="text-xl font-bold text-foreground">{registros?.length || 0}</p></div></div>
        </motion.div>
        {CATEGORIAS.map((cat, i) => {
          const count = registros?.filter((r: any) => r.categoria === cat.value).length || 0;
          const Icon = cat.icon;
          return (
            <motion.div key={cat.value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.1 }} className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg bg-${cat.value === 'ambiental' ? 'success' : cat.value === 'social' ? 'info' : 'warning'}/10 flex items-center justify-center`}><Icon className={`w-5 h-5 ${cat.color}`} /></div><div><p className="text-xs text-muted-foreground">{cat.label}</p><p className="text-xl font-bold text-foreground">{count}</p></div></div>
            </motion.div>
          );
        })}
      </div>

      {comMeta.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /><h3 className="font-display font-semibold text-foreground">Atingimento de Metas</h3></div>
            <span className="text-sm font-medium text-muted-foreground">{atingiramMeta.length}/{comMeta.length} metas atingidas</span>
          </div>
          <Progress value={percentualMeta} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">{percentualMeta}% das metas definidas foram alcançadas</p>
        </div>
      )}

      <Tabs defaultValue="graficos" className="w-full">
        <TabsList><TabsTrigger value="graficos">Gráficos</TabsTrigger><TabsTrigger value="registros">Registros</TabsTrigger></TabsList>
        <TabsContent value="graficos" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display font-semibold text-foreground mb-4">Distribuição por Categoria</h3>
              {registros && registros.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart><Pie data={byCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={entry => entry.name}>{byCategoria.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-12">Sem dados ainda</p>}
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display font-semibold text-foreground mb-4">Top Indicadores</h3>
              {topIndicadores.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topIndicadores} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis dataKey="indicador" type="category" width={120} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip /><Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-12">Sem dados ainda</p>}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="registros" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !registros || registros.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Recycle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum registro encontrado.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Indicador</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Fazenda</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Meta</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r: any) => {
                      const metaAtingida = r.meta && r.valor >= r.meta;
                      return (
                        <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium text-foreground">{r.indicador}</td>
                          <td className="p-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.categoria === 'ambiental' ? 'bg-success/10 text-success' : r.categoria === 'social' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>{r.categoria}</span>
                          </td>
                          <td className="p-3 text-muted-foreground">{r.fazendas?.nome || '-'}</td>
                          <td className="p-3 text-right font-semibold text-foreground">{r.valor} {r.unidade}</td>
                          <td className="p-3 text-right text-muted-foreground">{r.meta ? `${r.meta} ${r.unidade}` : '-'}</td>
                          <td className="p-3 text-center">
                            {r.meta ? (metaAtingida ? <TrendingUp className="w-4 h-4 text-success mx-auto" /> : <TrendingDown className="w-4 h-4 text-destructive mx-auto" />) : <span className="text-xs text-muted-foreground">-</span>}
                          </td>
                          <td className="p-3 text-center">
                            <button onClick={() => deleteMutation.mutate(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
