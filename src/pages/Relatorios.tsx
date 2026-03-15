import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserFazendas } from "@/hooks/use-user-fazendas";
import { FileText, Download, Loader2, BarChart3, DollarSign, Package, Users, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportType = "financeiro" | "estoque" | "funcionarios" | "pragas" | "plantio";

const reportTypes: { value: ReportType; label: string; icon: any; description: string }[] = [
  { value: "financeiro", label: "Financeiro", icon: DollarSign, description: "Receitas, despesas e balanço" },
  { value: "estoque", label: "Estoque", icon: Package, description: "Itens em estoque e alertas" },
  { value: "funcionarios", label: "Funcionários", icon: Users, description: "Quadro de colaboradores" },
  { value: "pragas", label: "Pragas & Doenças", icon: Bug, description: "Ocorrências registradas" },
  { value: "plantio", label: "Plantio", icon: BarChart3, description: "Safras e progresso" },
];

export default function Relatorios() {
  const { fazendas, isLoading: loadingFazendas } = useUserFazendas();
  const [selectedFarm, setSelectedFarm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<ReportType>("financeiro");
  const [generating, setGenerating] = useState(false);

  const farmId = selectedFarm || fazendas?.[0]?.id || "";

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["report", selectedType, farmId],
    enabled: !!farmId,
    queryFn: async (): Promise<any[]> => {
      const tableMap: Record<string, string> = {
        pragas: "pragas_ocorrencias",
        funcionarios: "funcionarios",
        financeiro: "transacoes_financeiras",
        plantio: "plantios",
        estoque: "estoque",
      };
      const tableName = tableMap[selectedType] || "estoque";
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .eq("fazenda_id" as any, farmId)
        .order("created_at" as any, { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const farmName = fazendas?.find((f) => f.id === farmId)?.nome || "Fazenda";

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const typeLabel = reportTypes.find((r) => r.value === selectedType)?.label || "";

      doc.setFontSize(18);
      doc.text(`Relatório de ${typeLabel}`, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`${farmName} — Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

      if (!reportData || reportData.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Nenhum registro encontrado.", 14, 45);
      } else {
        const columns = Object.keys(reportData[0]).filter(k => !["id", "created_at", "updated_at", "fazenda_id", "user_id"].includes(k));
        const rows = reportData.map((item: any) => columns.map(c => String(item[c] ?? "-")));
        autoTable(doc, {
          startY: 38,
          head: [columns.map(c => c.replace(/_/g, " ").toUpperCase())],
          body: rows,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [34, 120, 74] },
        });
      }

      doc.save(`relatorio-${selectedType}-${farmName.replace(/\s/g, "_")}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  if (loadingFazendas) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground text-sm mt-1">Gere relatórios consolidados com exportação em PDF</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Config panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-5 border border-border shadow-card space-y-4">
          <div className="space-y-2">
            <Label>Fazenda</Label>
            <select
              value={farmId}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {fazendas?.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <div className="space-y-2">
              {reportTypes.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setSelectedType(rt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all ${
                    selectedType === rt.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <rt.icon className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-medium">{rt.label}</p>
                    <p className="text-xs opacity-70">{rt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generatePDF} disabled={generating || !farmId} className="w-full">
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exportar PDF
          </Button>
        </motion.div>

        {/* Preview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="md:col-span-2 bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Pré-visualização</h2>
            <span className="text-xs text-muted-foreground ml-auto">{reportData?.length || 0} registros</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !reportData || reportData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Nenhum registro encontrado para esta fazenda.</div>
          ) : (
            <div className="overflow-auto max-h-[500px] rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {Object.keys(reportData[0])
                      .filter(k => !["id", "created_at", "updated_at", "fazenda_id", "user_id"].includes(k))
                      .map((k) => (
                        <th key={k} className="text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
                          {k.replace(/_/g, " ")}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 50).map((item: any, i: number) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30">
                      {Object.keys(item)
                        .filter(k => !["id", "created_at", "updated_at", "fazenda_id", "user_id"].includes(k))
                        .map((k) => (
                          <td key={k} className="px-3 py-2 text-foreground whitespace-nowrap">
                            {String(item[k] ?? "-")}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
