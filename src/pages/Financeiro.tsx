import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Plus, Loader2, Trash2, Pencil } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserFazendas } from "@/hooks/use-user-fazendas";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoriasList = ["Venda", "Insumos", "Mão de obra", "Combustível", "Manutenção", "Logística", "Outros"];
const emptyForm = { fazenda_id: "", descricao: "", valor: "", tipo: "despesa", data: "", categoria: "" };

export default function Financeiro() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData, fazendas } = useUserFazendas();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: transacoes, isLoading } = useQuery({
    queryKey: ["financeiro-real"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase.from("transacoes_financeiras").select("*, fazendas!inner(user_id, nome)").eq("fazendas.user_id", userData!.id).order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const { error } = await supabase.from("transacoes_financeiras").insert([{
        fazenda_id: f.fazenda_id, descricao: f.descricao.trim(), valor: Number(f.valor), tipo: f.tipo, data: f.data, categoria: f.categoria || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financeiro-real"] }); toast({ title: "Transação registrada" }); setIsAddOpen(false); setForm(emptyForm); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("transacoes_financeiras").update({
        descricao: item.descricao.trim(), valor: Number(item.valor), tipo: item.tipo, data: item.data, categoria: item.categoria || null,
      }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financeiro-real"] }); toast({ title: "Transação atualizada" }); setEditingItem(null); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("transacoes_financeiras").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financeiro-real"] }); toast({ title: "Transação removida" }); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fazenda_id || !form.descricao || !form.valor || !form.data) { toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return; }
    addMutation.mutate(form);
  };

  const handleEditSubmit = (e: React.FormEvent) => { e.preventDefault(); updateMutation.mutate(editingItem); };

  const openEdit = (t: any) => {
    setEditingItem({ id: t.id, descricao: t.descricao, valor: String(t.valor), tipo: t.tipo, data: t.data, categoria: t.categoria || "" });
  };

  const items = transacoes || [];
  const receitas = items.filter(t => t.tipo === "receita").reduce((a, t) => a + Number(t.valor), 0);
  const despesas = items.filter(t => t.tipo === "despesa").reduce((a, t) => a + Number(t.valor), 0);
  const saldo = receitas - despesas;

  const monthlyMap = new Map<string, { receitas: number; despesas: number }>();
  items.forEach(t => {
    const month = t.data.slice(0, 7);
    const entry = monthlyMap.get(month) || { receitas: 0, despesas: 0 };
    if (t.tipo === "receita") entry.receitas += Number(t.valor); else entry.despesas += Number(t.valor);
    monthlyMap.set(month, entry);
  });
  const chartData = Array.from(monthlyMap.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    .map(([month, data]) => ({ mes: new Date(month + "-15").toLocaleDateString("pt-BR", { month: "short" }), receitas: data.receitas, despesas: data.despesas }));

  const formatCurrency = (v: number) => {
    if (Math.abs(v) >= 1000000) return `R$ ${(v / 1000000).toFixed(2)}M`;
    if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toFixed(1)}K`;
    return `R$ ${v.toFixed(2)}`;
  };

  const TransactionFormFields = ({ data, setData }: { data: any; setData: (d: any) => void }) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select value={data.tipo} onValueChange={v => setData({ ...data, tipo: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="receita">Receita</SelectItem><SelectItem value="despesa">Despesa</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={data.categoria} onValueChange={v => setData({ ...data, categoria: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{categoriasList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descrição *</Label>
        <Input value={data.descricao} onChange={e => setData({ ...data, descricao: e.target.value })} placeholder="Ex: Venda de soja" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Valor (R$) *</Label>
          <Input type="number" min="0" step="0.01" value={data.valor} onChange={e => setData({ ...data, valor: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Data *</Label>
          <Input type="date" value={data.data} onChange={e => setData({ ...data, data: e.target.value })} />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão Financeira</h1>
          <p className="text-muted-foreground text-sm mt-1">Controle financeiro da sua operação agrícola</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nova Transação
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Transação</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Fazenda *</Label>
                <Select value={form.fazenda_id} onValueChange={v => setForm({ ...form, fazenda_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{fazendas.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <TransactionFormFields data={form} setData={setForm} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Transação</DialogTitle></DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <TransactionFormFields data={editingItem} setData={setEditingItem} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Wallet} title="Saldo" value={formatCurrency(saldo)} change={saldo >= 0 ? "Positivo" : "Negativo"} changeType={saldo >= 0 ? "positive" : "negative"} delay={0} />
        <MetricCard icon={TrendingUp} title="Receitas" value={formatCurrency(receitas)} change={`${items.filter(t => t.tipo === "receita").length} transações`} changeType="positive" delay={0.1} />
        <MetricCard icon={TrendingDown} title="Despesas" value={formatCurrency(despesas)} change={`${items.filter(t => t.tipo === "despesa").length} transações`} changeType="negative" delay={0.2} />
        <MetricCard icon={DollarSign} title="Total Transações" value={String(items.length)} change="Todas registradas" changeType="neutral" delay={0.3} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Nenhuma transação registrada. Adicione a primeira!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {chartData.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border">
              <h3 className="font-display font-semibold text-foreground mb-4">Fluxo de Caixa Mensal</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} /><stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="receitas" stroke="hsl(152, 60%, 40%)" fill="url(#receitaGrad)" strokeWidth={2} name="Receitas" />
                  <Area type="monotone" dataKey="despesas" stroke="hsl(0, 72%, 51%)" fill="url(#despesaGrad)" strokeWidth={2} name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`bg-card rounded-xl p-5 shadow-card border border-border ${chartData.length <= 1 ? 'lg:col-span-3' : ''}`}>
            <h3 className="font-display font-semibold text-foreground mb-4">Últimas Transações</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {items.slice(0, 20).map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.tipo === "receita" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {t.tipo === "receita" ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.descricao}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.data).toLocaleDateString("pt-BR")} · {t.categoria || "Sem categoria"}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.tipo === "receita" ? "text-success" : "text-destructive"}`}>
                    {t.tipo === "receita" ? "+" : "-"} R$ {Number(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteMutation.mutate(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
