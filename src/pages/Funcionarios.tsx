import { motion } from "framer-motion";
import {
  Users, Plus, Star, Clock, Calendar, Phone, Briefcase, ChevronRight,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

const funcionarios = [
  { id: 1, nome: "Carlos Silva", cargo: "Operador de Máquinas", setor: "Mecanização", telefone: "(64) 99999-1234", admissao: "15/03/2020", produtividade: 94, tarefasHoje: 3, status: "Em campo" },
  { id: 2, nome: "Maria Santos", cargo: "Agrônoma", setor: "Técnico", telefone: "(64) 99999-5678", admissao: "01/08/2021", produtividade: 98, tarefasHoje: 5, status: "Em campo" },
  { id: 3, nome: "João Oliveira", cargo: "Tratorista", setor: "Mecanização", telefone: "(64) 99999-9012", admissao: "10/01/2019", produtividade: 88, tarefasHoje: 2, status: "Em campo" },
  { id: 4, nome: "Ana Costa", cargo: "Adm. Financeiro", setor: "Administrativo", telefone: "(64) 99999-3456", admissao: "20/06/2022", produtividade: 96, tarefasHoje: 7, status: "Escritório" },
  { id: 5, nome: "Pedro Rocha", cargo: "Operador de Drone", setor: "Precisão", telefone: "(64) 99999-7890", admissao: "05/02/2024", produtividade: 91, tarefasHoje: 4, status: "Em campo" },
  { id: 6, nome: "Lucas Ferreira", cargo: "Mecânico Agrícola", setor: "Manutenção", telefone: "(64) 99999-2345", admissao: "12/11/2018", produtividade: 85, tarefasHoje: 2, status: "Oficina" },
];

const tarefasRecentes = [
  { func: "Carlos Silva", tarefa: "Preparo de solo - Talhão 5", status: "Em andamento", prioridade: "Alta" },
  { func: "Maria Santos", tarefa: "Análise de solo - Talhão 8", status: "Concluída", prioridade: "Média" },
  { func: "Pedro Rocha", tarefa: "Mapeamento aéreo - Talhões 1-4", status: "Em andamento", prioridade: "Alta" },
  { func: "João Oliveira", tarefa: "Aplicação de herbicida - Talhão 3", status: "Agendada", prioridade: "Média" },
  { func: "Lucas Ferreira", tarefa: "Revisão Trator Case IH", status: "Em andamento", prioridade: "Alta" },
];

const statusColor: Record<string, string> = {
  "Em campo": "bg-success/10 text-success",
  "Escritório": "bg-info/10 text-info",
  "Oficina": "bg-warning/10 text-warning",
  "Folga": "bg-muted text-muted-foreground",
};

const tarefaStatusColor: Record<string, string> = {
  "Em andamento": "bg-warning/10 text-warning",
  "Concluída": "bg-success/10 text-success",
  "Agendada": "bg-info/10 text-info",
};

export default function Funcionarios() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Funcionários</h1>
          <p className="text-muted-foreground text-sm mt-1">Equipe, tarefas e produtividade</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} title="Total de Funcionários" value="38" change="6 setores" changeType="neutral" delay={0} />
        <MetricCard icon={Briefcase} title="Em Campo Hoje" value="28" change="74% da equipe" changeType="positive" delay={0.1} />
        <MetricCard icon={Star} title="Produtividade Méd." value="92%" change="+3% vs mês anterior" changeType="positive" delay={0.2} />
        <MetricCard icon={Clock} title="Horas (Mês)" value="6.080h" change="Média 160h/func." changeType="neutral" delay={0.3} />
      </div>

      {/* Employee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funcionarios.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                  {f.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground text-sm">{f.nome}</h4>
                  <p className="text-xs text-muted-foreground">{f.cargo}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[f.status] || "bg-muted text-muted-foreground"}`}>
                {f.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" /> {f.setor}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /> {f.admissao}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="w-3.5 h-3.5" /> {f.produtividade}% prod.
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" /> {f.tarefasHoje} tarefas
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tasks */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Tarefas do Dia</h3>
        <div className="space-y-3">
          {tarefasRecentes.map((t, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t.tarefa}</p>
                <p className="text-xs text-muted-foreground">{t.func}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${tarefaStatusColor[t.status] || ""}`}>
                {t.status}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
