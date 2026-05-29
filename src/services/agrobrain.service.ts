type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type AgrobrainMsg = {
  role: "user" | "assistant";
  content: string | ContentPart[];
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agrobrain-chat`;

export const agrobrainService = {
  streamChat: async ({
    messages,
    onDelta,
    onDone,
  }: {
    messages: AgrobrainMsg[];
    onDelta: (t: string) => void;
    onDone: () => void;
  }) => {
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
        if (json === "[DONE]") {
          done = true;
          break;
        }
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
      for (const raw of buf.split("\n")) {
        if (!raw || !raw.startsWith("data: ")) continue;
        const json = raw.replace(/\r$/, "").slice(6).trim();
        if (json === "[DONE]") continue;
        try {
          const c = JSON.parse(json).choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch {
          /* ignore */
        }
      }
    }
    onDone();
  },
};
