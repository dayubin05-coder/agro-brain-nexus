import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot, Camera, TrendingUp, Sprout, Send, Leaf, Brain, Lightbulb,
  CloudSun, BarChart3, Scan, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agrobrain-chat`;

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

type Msg = { role: "user" | "assistant"; content: string };

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => null);
    const errorMsg = errorData?.error || "Erro ao conectar com a IA";
    throw new Error(errorMsg);
  }

  if (!resp.body) throw new Error("Stream não disponível");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export default function IAAgricola() {
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversas, setConversas] = useState<Msg[]>([
    { role: "assistant", content: "Olá! Sou o **AgroBrain**, seu assistente agrícola inteligente. 🌱\n\nPosso ajudar com:\n- **Previsões de safra** e produtividade\n- **Diagnóstico de pragas** e doenças\n- **Recomendações de manejo** e fertilização\n- **Análise climática** e impactos na produção\n- **Simulações financeiras** de cenários\n\nComo posso ajudar hoje?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversas]);

  const enviarMensagem = async (texto?: string) => {
    const msg = texto || mensagem;
    if (!msg.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: msg };
    setConversas(prev => [...prev, userMsg]);
    setMensagem("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...conversas.filter(c => c.role !== "assistant" || conversas.indexOf(c) !== 0), userMsg];

    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setConversas(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && last.content === assistantSoFar.slice(0, -nextChunk.length)) {
          return [...prev.slice(0, -1), { role: "assistant", content: assistantSoFar }];
        }
        if (last?.role === "assistant" && assistantSoFar.length > nextChunk.length) {
          return [...prev.slice(0, -1), { role: "assistant", content: assistantSoFar }];
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      toast({
        title: "Erro no AgroBrain",
        description: e.message || "Não foi possível obter resposta da IA",
        variant: "destructive",
      });
      setConversas(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente em instantes." }]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">AgroBrain — IA Agrícola</h1>
        <p className="text-muted-foreground text-sm mt-1">Assistente inteligente para otimizar sua produção</p>
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
            <h3 className="font-display font-semibold text-foreground text-sm">AgroBrain</h3>
            <p className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success" /> Online — Powered by Lovable AI</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {conversas.map((c, i) => (
            <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                c.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {c.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{c.content}</ReactMarkdown>
                  </div>
                ) : (
                  c.content
                )}
              </div>
            </div>
          ))}
          {isLoading && conversas[conversas.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                AgroBrain está pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {exemploConversas.slice(0, 3).map((e, i) => (
              <button key={i} onClick={() => !isLoading && enviarMensagem(e)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
                {e.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border flex items-center gap-3">
          <input
            type="text"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enviarMensagem()}
            placeholder="Pergunte sobre sua fazenda..."
            disabled={isLoading}
            className="flex-1 bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          <button onClick={() => enviarMensagem()}
            disabled={isLoading || !mensagem.trim()}
            className="p-2.5 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
