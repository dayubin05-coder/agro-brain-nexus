import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Star, Calendar, Phone, Briefcase, Loader2, Trash2 } from "lucide-react";
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

const setores = ["Mecanização", "Técnico", "Administrativo", "Manutenção", "Campo", "Precisão"];

const statusColor: Record<string, string> = {
  ativo: "bg-success/10 text-success",
  ferias: "bg-info/10 text-info",
  afastado: "bg-warning/10 text-warning",
  desligado: "bg-muted text-muted-foreground",
};

export default function Funcionarios() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData, fazendas } = useUserFazendas();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    fazenda_id: "", nome: "", cargo: "", setor: "", telefone: "", data_admissao: "", status: "ativo",
  });

  const { data: funcionarios, isLoading } = useQuery({
    queryKey: ["funcionarios-real"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("*, fazendas!inner(user_id, nome)")
        .eq("fazendas.user_id", userData!.id)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const { error } = await supabase.from("funcionarios").insert([{
        fazenda_id: f.fazenda_id,
        nome: f.nome.trim(),
        cargo: f.cargo || null,
        setor: f.setor || null,
        telefone: f.telefone || null,
        data_admissao: f.data_admissao || null,
        status: f.status,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios-real"] });
      toast({ title: "Funcionário cadastrado" });
      setIsAddOpen(false);
      setForm({ fazenda_id: "", nome: "", cargo: "", setor: "", telefone: "", data_admissao: "", status: "ativo" });
    },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("funcionarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios-real"] });
      toast({ title: "Funcionário removido" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fazenda_id || !form.nome) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    addMutation.mutate(form);
  };

  const items = funcionarios || [];
  const ativos = items.filter(f => f.status === "ativo").length;
  const prodMedia = items.length > 0 ? Math.round(items.reduce((acc, f) => acc + (f.produtividade_percentual || 0), 0) / items.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Funcionários</h1>
          <p className="text-muted-foreground text-sm mt-1">Equipe e produtividade</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Novo Funcionário
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Funcionário</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Fazenda *</Label>
                <Select value={form.fazenda_id} onValueChange={v => setForm({ ...form, fazenda_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{fazendas.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome do funcionário" />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="Ex: Operador de Máquinas" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Setor</Label>
                  <Select value={form.setor} onValueChange={v => setForm({ ...form, setor: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{setores.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Admissão</Label>
                  <Input type="date" value={form.data_admissao} onChange={e => setForm({ ...form, data_admissao: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                      <SelectItem value="afastado">Afastado</SelectItem>
                      <SelectItem value="desligado">Desligado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} title="Total de Funcionários" value={String(items.length)} change={`${new Set(items.map(f => f.setor).filter(Boolean)).size} setores`} changeType="neutral" delay={0} />
        <MetricCard icon={Briefcase} title="Ativos" value={String(ativos)} change={items.length > 0 ? `${Math.round(ativos / items.length * 100)}% da equipe` : "-"} changeType="positive" delay={0.1} />
        <MetricCard icon={Star} title="Produtividade Méd." value={prodMedia > 0 ? `${prodMedia}%` : "-"} change="Média geral" changeType="neutral" delay={0.2} />
        <MetricCard icon={Users} title="Fazendas" value={String(new Set(items.map(f => f.fazenda_id)).size)} change="Com funcionários" changeType="neutral" delay={0.3} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Nenhum funcionário cadastrado. Adicione o primeiro!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                    {f.nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm">{f.nome}</h4>
                    <p className="text-xs text-muted-foreground">{f.cargo || "Sem cargo"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColor[f.status || "ativo"] || statusColor.ativo}`}>
                    {f.status || "ativo"}
                  </span>
                  <button onClick={() => deleteMutation.mutate(f.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                {f.setor && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5" /> {f.setor}
                  </div>
                )}
                {f.data_admissao && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(f.data_admissao).toLocaleDateString("pt-BR")}
                  </div>
                )}
                {f.telefone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" /> {f.telefone}
                  </div>
                )}
                {f.produtividade_percentual != null && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Star className="w-3.5 h-3.5" /> {f.produtividade_percentual}% prod.
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
