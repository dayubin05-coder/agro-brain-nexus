import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  History, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  User,
  Search,
  Download,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AuditoriaRLS() {
  const [search, setSearch] = useState("");
  const [showTableStatus, setShowTableStatus] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["security-audit-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_audit_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredReports = reports?.filter(r => 
    r.titulo.toLowerCase().includes(search.toLowerCase()) || 
    r.resumo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Histórico de Auditorias RLS</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registro de todas as validações de segurança e conformidade de dados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/5 text-success border-success/20 gap-1.5 px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Infraestrutura Protegida
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sumário */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Estado Atual
            </CardTitle>
            <CardDescription>Resumo da última auditoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground">Tabelas Protegidas</span>
                <span className="text-sm font-bold text-success">15/15</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-success h-1.5 rounded-full w-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" />
                RLS Ativado em todas as tabelas
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Políticas de Acesso validadas
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 text-warning" />
                1 tabela de sistema ignorada
              </div>
            </div>

            <Button className="w-full gap-2" variant="outline">
              <Download className="w-4 h-4" />
              Relatório de Conformidade
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Auditorias */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Buscar auditorias por título ou descrição..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredReports?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma auditoria registrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports?.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card p-4 rounded-xl border border-border hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {report.titulo}
                          <Badge className="bg-success/10 text-success hover:bg-success/20 border-none">Conforme</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {report.resumo}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(report.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            Admin System
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0">
                      <a 
                        href={report.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Visualizar PDF
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
