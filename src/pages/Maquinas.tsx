import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Wrench, Fuel, Clock, MapPin, Plus, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
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

const tipos = ["Trator", "Colheitadeira", "Pulverizador", "Implemento", "Drone", "Caminhão", "Outro"];
const statusOptions = ["operando", "parada", "manutencao"];

const statusIcon: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  operando: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Operando" },
  parada: { icon: XCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Parada" },
  manutencao: { icon: Wrench, color: "text-warning", bg: "bg-warning/10", label: "Manutenção" },
};

export default function Maquinas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData, fazendas } = useUserFazendas();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    fazenda_id: "", nome: "", tipo: "", modelo: "", ano: "", status: "parada",
    horas_uso: "", combustivel_percentual: "", proxima_manutencao: "",
  });

  const { data: maquinas, isLoading } = useQuery({
    queryKey: ["maquinas-real"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maquinas")
        .select("*, fazendas!inner(user_id, nome)")
        .eq("fazendas.user_id", userData!.id)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const { error } = await supabase.from("maquinas").insert([{
        fazenda_id: f.fazenda_id,
        nome: f.nome.trim(),
        tipo: f.tipo || null,
        modelo: f.modelo || null,
        ano: f.ano ? Number(f.ano) : null,
        status: f.status,
        horas_uso: f.horas_uso ? Number(f.horas_uso) : 0,
        combustivel_percentual: f.combustivel_percentual ? Number(f.combustivel_percentual) : null,
        proxima_manutencao: f.proxima_manutencao || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maquinas-real"] });
      toast({ title: "Máquina cadastrada" });
      setIsAddOpen(false);
      setForm({ fazenda_id: "", nome: "", tipo: "", modelo: "", ano: "", status: "parada", horas_uso: "", combustivel_percentual: "", proxima_manutencao: "" });
    },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("maquinas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maquinas-real"] });
      toast({ title: "Máquina removida" });
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

  const items = maquinas || [];
  const operando = items.filter(m => m.status === "operando").length;
  const emManutencao = items.filter(m => m.status === "manutencao").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Máquinas</h1>
          <p className="text-muted-foreground text-sm mt-1">Controle de equipamentos e manutenção</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Cadastrar Máquina
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Máquina</DialogTitle></DialogHeader>
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
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Trator John Deere" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} placeholder="8R 410" />
                </div>
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Input type="number" value={form.ano} onChange={e => setForm({ ...form, ano: e.target.value })} placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label>Horas de Uso</Label>
                  <Input type="number" value={form.horas_uso} onChange={e => setForm({ ...form, horas_uso: e.target.value })} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parada">Parada</SelectItem>
                      <SelectItem value="operando">Operando</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Combustível (%)</Label>
                  <Input type="number" min="0" max="100" value={form.combustivel_percentual} onChange={e => setForm({ ...form, combustivel_percentual: e.target.value })} />
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
        <MetricCard icon={Truck} title="Total de Máquinas" value={String(items.length)} change={`${new Set(items.map(m => m.tipo)).size} tipos`} changeType="neutral" delay={0} />
        <MetricCard icon={CheckCircle} title="Em Operação" value={String(operando)} change={items.length > 0 ? `${Math.round(operando / items.length * 100)}% da frota` : "-"} changeType="positive" delay={0.1} />
        <MetricCard icon={Wrench} title="Em Manutenção" value={String(emManutencao)} change={emManutencao > 0 ? "Atenção necessária" : "Nenhuma"} changeType={emManutencao > 0 ? "negative" : "positive"} delay={0.2} />
        <MetricCard icon={Fuel} title="Paradas" value={String(items.filter(m => m.status === "parada").length)} change="Sem operação" changeType="neutral" delay={0.3} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Truck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Nenhuma máquina cadastrada. Adicione a primeira!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m, i) => {
            const st = statusIcon[m.status || "parada"] || statusIcon["parada"];
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm">{m.nome}</h4>
                    <p className="text-xs text-muted-foreground">{m.tipo || "Sem tipo"} {m.modelo ? `· ${m.modelo}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${st.bg} ${st.color}`}>
                      <st.icon className="w-3 h-3" /> {st.label}
                    </div>
                    <button onClick={() => deleteMutation.mutate(m.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{(m.horas_uso || 0).toLocaleString()}h</span>
                  </div>
                  {m.ano && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Ano: {m.ano}</span>
                    </div>
                  )}
                  {m.combustivel_percentual != null && (
                    <div className="flex items-center gap-2 text-xs col-span-2">
                      <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="flex items-center gap-1 flex-1">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${m.combustivel_percentual > 50 ? 'bg-success' : m.combustivel_percentual > 20 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${m.combustivel_percentual}%` }} />
                        </div>
                        <span className="text-muted-foreground">{m.combustivel_percentual}%</span>
                      </div>
                    </div>
                  )}
                  {m.proxima_manutencao && (
                    <div className="flex items-center gap-2 text-xs col-span-2">
                      <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Próx. manutenção: {m.proxima_manutencao}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
