import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { talhoesService } from "@/services/talhoes.service";
import { qk } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface TalhoesManagerProps {
  farmId: string;
  farmName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyTalhao = { nome: "", area: "", observacoes: "" };

export default function TalhoesManager({ farmId, farmName, open, onOpenChange }: TalhoesManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyTalhao);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.talhoes(farmId) });
    queryClient.invalidateQueries({ queryKey: ["fazendas"] });
  };

  const { data: talhoes, isLoading } = useQuery({
    queryKey: qk.talhoes(farmId),
    enabled: open,
    queryFn: () => talhoesService.listByFarm(farmId),
  });

  const addMutation = useMutation({
    mutationFn: (d: typeof emptyTalhao) => talhoesService.create(farmId, d),
    onSuccess: () => {
      invalidate();
      toast({ title: "Talhão adicionado" });
      setIsAddOpen(false);
      setForm(emptyTalhao);
    },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => talhoesService.update(d.id, d),
    onSuccess: () => {
      invalidate();
      toast({ title: "Talhão atualizado" });
      setEditing(null);
    },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => talhoesService.remove(id),
    onSuccess: () => {
      invalidate();
      toast({ title: "Talhão removido" });
    },
    onError: (e) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const TalhaoForm = ({ data, setData, onSubmit, isPending, submitLabel }: any) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Nome do Talhão</Label>
        <Input required value={data.nome} onChange={(e) => setData({ ...data, nome: e.target.value })} placeholder="Ex: Talhão A1" />
      </div>
      <div className="space-y-2">
        <Label>Área (ha)</Label>
        <Input type="number" required min="0" step="0.01" value={data.area} onChange={(e) => setData({ ...data, area: e.target.value })} placeholder="Ex: 50" />
      </div>
      <div className="space-y-2">
        <Label>Observações</Label>
        <Input value={data.observacoes} onChange={(e) => setData({ ...data, observacoes: e.target.value })} placeholder="Opcional" />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{submitLabel}
        </Button>
      </div>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Talhões — {farmName}
          </DialogTitle>
          <DialogDescription>Gerencie os talhões desta fazenda.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Button size="sm" onClick={() => { setForm(emptyTalhao); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Novo Talhão
          </Button>
        </div>

        {/* Add form */}
        {isAddOpen && (
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">Novo Talhão</h4>
            <TalhaoForm data={form} setData={setForm} onSubmit={(d: any) => addMutation.mutate(d)} isPending={addMutation.isPending} submitLabel="Adicionar" />
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">Editar Talhão</h4>
              <button onClick={() => setEditing(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
            </div>
            <TalhaoForm data={editing} setData={setEditing} onSubmit={(d: any) => updateMutation.mutate(d)} isPending={updateMutation.isPending} submitLabel="Salvar" />
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : !talhoes || talhoes.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">Nenhum talhão cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {talhoes.map((t: any, i: number) => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.area} ha {t.observacoes ? `· ${t.observacoes}` : ""}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing({ id: t.id, nome: t.nome, area: String(t.area), observacoes: t.observacoes || "" })}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(t.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
