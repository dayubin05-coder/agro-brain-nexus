import { useState } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, Plus, Search, Loader2, Trash2, Pencil } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserFazendas } from "@/hooks/use-user-fazendas";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL, formatBRLKilo } from "@/lib/formatters";
import { formatBRL, formatBRLKilo } from "@/lib/formatters";
const categorias = ["Sementes", "Fertilizantes", "Defensivos", "Combustível", "Peças", "Outros"];
const emptyForm = { fazenda_id: "", nome: "", categoria: "", quantidade: "", unidade: "kg", quantidade_minima: "", valor_unitario: "" };

export default function Estoque() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData, fazendas } = useUserFazendas();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  const { data: estoque, isLoading } = useQuery({
    queryKey: ["estoque-real"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase.from("estoque").select("*, fazendas!inner(user_id, nome)").eq("fazendas.user_id", userData!.id).order("nome");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const { error } = await supabase.from("estoque").insert([{
        fazenda_id: f.fazenda_id, nome: f.nome.trim(), categoria: f.categoria || null,
        quantidade: Number(f.quantidade), unidade: f.unidade,
        quantidade_minima: f.quantidade_minima ? Number(f.quantidade_minima) : null,
        valor_unitario: f.valor_unitario ? Number(f.valor_unitario) : null,
        data_entrada: new Date().toISOString().split("T")[0],
      }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["estoque-real"] }); toast({ title: "Item adicionado ao estoque" }); setIsAddOpen(false); setForm(emptyForm); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("estoque").update({
        nome: item.nome.trim(), categoria: item.categoria || null,
        quantidade: Number(item.quantidade), unidade: item.unidade,
        quantidade_minima: item.quantidade_minima ? Number(item.quantidade_minima) : null,
        valor_unitario: item.valor_unitario ? Number(item.valor_unitario) : null,
      }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["estoque-real"] }); toast({ title: "Item atualizado" }); setEditingItem(null); },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("estoque").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["estoque-real"] }); toast({ title: "Item removido" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fazenda_id || !form.nome || !form.quantidade) { toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return; }
    addMutation.mutate(form);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editingItem);
  };

  const openEdit = (item: any) => {
    setEditingItem({
      id: item.id, nome: item.nome, categoria: item.categoria || "", quantidade: String(item.quantidade),
      unidade: item.unidade, quantidade_minima: item.quantidade_minima ? String(item.quantidade_minima) : "",
      valor_unitario: item.valor_unitario ? String(item.valor_unitario) : "",
    });
  };

  const items = estoque || [];
  const filtered = items.filter(i => i.nome.toLowerCase().includes(search.toLowerCase()));
  const alertas = items.filter(i => i.quantidade_minima && i.quantidade <= i.quantidade_minima).length;
  const valorTotal = items.reduce((acc, i) => acc + (i.valor_unitario ? i.valor_unitario * i.quantidade : 0), 0);

  const getStatus = (item: any) => {
    if (!item.quantidade_minima) return "normal";
    if (item.quantidade <= item.quantidade_minima * 0.5) return "critico";
    if (item.quantidade <= item.quantidade_minima) return "baixo";
    return "normal";
  };

  const ItemFormFields = ({ data, setData }: { data: any; setData: (d: any) => void }) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Item *</Label>
          <Input value={data.nome} onChange={e => setData({ ...data, nome: e.target.value })} placeholder="Ex: Semente Soja" />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={data.categoria} onValueChange={v => setData({ ...data, categoria: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Quantidade *</Label>
          <Input type="number" min="0" value={data.quantidade} onChange={e => setData({ ...data, quantidade: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Unidade</Label>
          <Select value={data.unidade} onValueChange={v => setData({ ...data, unidade: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["kg", "L", "un", "ton", "sc"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Qtd. Mínima</Label>
          <Input type="number" min="0" value={data.quantidade_minima} onChange={e => setData({ ...data, quantidade_minima: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Valor Unitário (R$)</Label>
        <Input type="number" min="0" step="0.01" value={data.valor_unitario} onChange={e => setData({ ...data, valor_unitario: e.target.value })} />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Estoque</h1>
          <p className="text-muted-foreground text-sm mt-1">Controle de insumos e materiais da fazenda</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nova Entrada
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Item ao Estoque</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Fazenda *</Label>
                <Select value={form.fazenda_id} onValueChange={v => setForm({ ...form, fazenda_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{fazendas.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <ItemFormFields data={form} setData={setForm} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Adicionar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Item</DialogTitle></DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <ItemFormFields data={editingItem} setData={setEditingItem} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Salvar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Package} title="Total de Itens" value={String(items.length)} change={`${new Set(items.map(i => i.categoria)).size} categorias`} changeType="neutral" delay={0} />
        <MetricCard icon={AlertTriangle} title="Estoque Baixo" value={`${alertas} itens`} change={alertas > 0 ? "Ação necessária" : "Tudo OK"} changeType={alertas > 0 ? "negative" : "positive"} delay={0.1} />
        <MetricCard icon={Package} title="Valor Total" value={formatBRLKilo(valorTotal)} change="Insumos em estoque" changeType="neutral" delay={0.2} />
        <MetricCard icon={Package} title="Fazendas" value={String(new Set(items.map(i => i.fazenda_id)).size)} change="Com estoque" changeType="neutral" delay={0.3} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Nenhum item no estoque. Adicione o primeiro!</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">Inventário</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Buscar item..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-32" />
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
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{item.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.categoria || "-"}</td>
                      <td className="py-3 px-4 text-right text-foreground">{Number(item.quantidade).toLocaleString()} {item.unidade}</td>
                      <td className="py-3 px-4 text-right text-foreground">
                        {item.valor_unitario ? formatBRL(item.valor_unitario * item.quantidade) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          status === "normal" ? "bg-success/10 text-success" : status === "baixo" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                        }`}>{status === "normal" ? "Normal" : status === "baixo" ? "Baixo" : "Crítico"}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(item)} className="text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteMutation.mutate(item.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
