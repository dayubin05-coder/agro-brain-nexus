import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot, Camera, Send, Brain, Lightbulb,
  CloudSun, BarChart3, Scan, Loader2, ImagePlus, X,
} from "lucide-react";
import { agrobrainService, type AgrobrainMsg } from "@/services/agrobrain.service";


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
];

// A message content can be a string or multimodal array
type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type MsgContent = string | ContentPart[];
type Msg = { role: "user" | "assistant"; content: MsgContent };

// For display purposes
type DisplayMsg = {
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
};

function toDisplayMsg(m: Msg): DisplayMsg {
  if (typeof m.content === "string") {
    return { role: m.role, text: m.content };
  }
  const textPart = m.content.find(p => p.type === "text") as { type: "text"; text: string } | undefined;
  const imgPart = m.content.find(p => p.type === "image_url") as { type: "image_url"; image_url: { url: string } } | undefined;
  return {
    role: m.role,
    text: textPart?.text || "",
    imageUrl: imgPart?.image_url?.url,
  };
}

async function streamChat({ messages, onDelta, onDone }: {
  messages: Msg[];
  onDelta: (t: string) => void;
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
    throw new Error(errorData?.error || "Erro ao conectar com a IA");
  }
  if (!resp.body) throw new Error("Stream não disponível");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });

    let ni: number;
    while ((ni = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, ni);
      buf = buf.slice(ni + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || !line.trim() || !line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }

  if (buf.trim()) {
    for (let raw of buf.split("\n")) {
      if (!raw || !raw.startsWith("data: ")) continue;
      const json = raw.replace(/\r$/, "").slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {}
    }
  }
  onDone();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function IAAgricola() {
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversas, setConversas] = useState<Msg[]>([
    { role: "assistant", content: "Olá! Sou o **AgroBrain**, seu assistente agrícola inteligente. 🌱\n\nPosso ajudar com:\n- **Previsões de safra** e produtividade\n- **Diagnóstico por foto** — envie uma foto da planta 📸\n- **Recomendações de manejo** e fertilização\n- **Análise climática** e impactos na produção\n\nComo posso ajudar hoje?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversas]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Envie apenas imagens (JPG, PNG, etc.)", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "O tamanho máximo é 10 MB.", variant: "destructive" });
      return;
    }
    const base64 = await fileToBase64(file);
    setImagePreview(base64);
    if (e.target) e.target.value = "";
  };

  const enviarMensagem = async (texto?: string) => {
    const msg = texto || mensagem;
    if ((!msg.trim() && !imagePreview) || isLoading) return;

    let userContent: MsgContent;
    const currentImage = imagePreview;

    if (currentImage) {
      const parts: ContentPart[] = [];
      parts.push({ type: "text", text: msg.trim() || "Analise esta imagem e identifique possíveis pragas, doenças ou deficiências nutricionais na planta." });
      parts.push({ type: "image_url", image_url: { url: currentImage } });
      userContent = parts;
    } else {
      userContent = msg;
    }

    const userMsg: Msg = { role: "user", content: userContent };
    setConversas(prev => [...prev, userMsg]);
    setMensagem("");
    setImagePreview(null);
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...conversas.filter((_, i) => i !== 0), userMsg];

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setConversas(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && assistantSoFar.length > chunk.length) {
          return [...prev.slice(0, -1), { role: "assistant", content: assistantSoFar }];
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      toast({ title: "Erro no AgroBrain", description: e.message || "Não foi possível obter resposta da IA", variant: "destructive" });
      setConversas(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente em instantes." }]);
    }
  };

  const displayMessages = conversas.map(toDisplayMsg);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">AgroBrain — IA Agrícola</h1>
        <p className="text-muted-foreground text-sm mt-1">Assistente inteligente para otimizar sua produção</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {funcionalidades.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
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
          {displayMessages.map((c, i) => (
            <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                c.role === "user" ? "gradient-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {c.imageUrl && (
                  <img src={c.imageUrl} alt="Imagem enviada" className="rounded-lg mb-2 max-h-48 object-cover" />
                )}
                {c.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{c.text}</ReactMarkdown>
                  </div>
                ) : (
                  c.text && <p>{c.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && displayMessages[displayMessages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                AgroBrain está analisando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {exemploConversas.map((e, i) => (
              <button key={i} onClick={() => !isLoading && enviarMensagem(e)} disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
                {e.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-border object-cover" />
              <button onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border flex items-center gap-3">
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageSelect} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isLoading}
            className="p-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            title="Enviar foto para diagnóstico">
            <ImagePlus className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enviarMensagem()}
            placeholder={imagePreview ? "Descreva o problema (opcional)..." : "Pergunte sobre sua fazenda..."}
            disabled={isLoading}
            className="flex-1 bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          <button onClick={() => enviarMensagem()}
            disabled={isLoading || (!mensagem.trim() && !imagePreview)}
            className="p-2.5 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
