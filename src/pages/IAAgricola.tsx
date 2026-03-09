import { motion } from "framer-motion";
import { useState } from "react";
import {
  Bot, Camera, TrendingUp, Sprout, Send, Leaf, Brain, Lightbulb,
  CloudSun, BarChart3, Scan,
} from "lucide-react";

const funcionalidades = [
  { icon: Brain, titulo: "Previsão de Safra", desc: "IA analisa dados históricos, clima e solo para prever produtividade" },
  { icon: Camera, titulo: "Diagnóstico por Foto", desc: "Tire foto da planta e a IA detecta doenças, pragas e deficiências" },
  { icon: Lightbulb, titulo: "Recomendação de Manejo", desc: "Recomendações personalizadas de fertilização, plantio e controle" },
  { icon: CloudSun, titulo: "Previsão Climática", desc: "Análise climática avançada com impacto na produção" },
  { icon: BarChart3, titulo: "Simulação Financeira", desc: "Simule cenários de troca de cultura, preço e investimento" },
  { icon: Scan, titulo: "Análise NDVI", desc: "Processamento de imagens de satélite e drone para vigor da lavoura" },
];

const exemploConversas = [
  "Qual melhor cultura para plantar no talhão 5 na próxima safra?",
  "Quanto fertilizante devo aplicar na soja do talhão 12?",
  "Qual a previsão de produtividade para a safra atual?",
  "Analise o clima dos próximos 15 dias para minha região",
  "Simule o lucro se eu trocar milho por algodão no talhão 3",
];

export default function IAAgricola() {
  const [mensagem, setMensagem] = useState("");
  const [conversas, setConversas] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente agrícola do AgroTech. Posso ajudar com previsões de safra, diagnóstico de pragas, recomendações de manejo e muito mais. Como posso ajudar hoje?" },
  ]);

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;
    setConversas(prev => [...prev, { role: "user", content: mensagem }]);
    setTimeout(() => {
      setConversas(prev => [...prev, {
        role: "assistant",
        content: "Esta é uma demonstração do assistente agrícola com IA. Para funcionalidade completa, é necessário ativar o Lovable Cloud e conectar ao serviço de IA. O assistente analisará dados da sua fazenda, clima, solo e mercado para fornecer recomendações personalizadas."
      }]);
    }, 1000);
    setMensagem("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">IA Agrícola</h1>
        <p className="text-muted-foreground text-sm mt-1">Inteligência artificial para otimizar sua produção</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {funcionalidades.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-card-hover hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3 group-hover:gradient-primary transition-all">
              <f.icon className="w-5 h-5 text-accent-foreground group-hover:text-primary-foreground" />
            </div>
            <h4 className="font-display font-semibold text-foreground">{f.titulo}</h4>
            <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Chat */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">Assistente Agrícola</h3>
            <p className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success" /> Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {conversas.map((c, i) => (
            <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                c.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {c.content}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {exemploConversas.slice(0, 3).map((e, i) => (
              <button key={i} onClick={() => setMensagem(e)}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                {e.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Camera className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            type="text"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enviarMensagem()}
            placeholder="Pergunte sobre sua fazenda..."
            className="flex-1 bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={enviarMensagem}
            className="p-2.5 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
