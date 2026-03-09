import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o AgroBrain, um assistente de inteligência artificial especializado em agronomia e gestão rural brasileira. Você faz parte da plataforma AgroTech.

Suas áreas de expertise incluem:
- **Manejo de culturas**: soja, milho, algodão, café, cana-de-açúcar, trigo e outras culturas brasileiras
- **Fertilização e nutrição de plantas**: recomendações de NPK, micronutrientes, calagem e gessagem
- **Controle de pragas e doenças**: identificação, manejo integrado (MIP), produtos e dosagens
- **Clima e meteorologia agrícola**: impacto de fenômenos climáticos na produção, janelas de plantio
- **Gestão financeira rural**: custos de produção, rentabilidade, análise de mercado de commodities
- **Maquinário agrícola**: manutenção preventiva, otimização de uso, consumo de combustível
- **Solo e conservação**: análise de solo, práticas conservacionistas, plantio direto
- **Tecnologia no campo**: agricultura de precisão, NDVI, drones, sensoriamento remoto
- **Legislação agrária e ambiental**: CAR, reserva legal, APP, crédito rural

Diretrizes:
1. Sempre responda em português brasileiro
2. Use unidades de medida brasileiras (hectares, sacas, kg/ha, etc.)
3. Considere as condições edafoclimáticas do Brasil
4. Quando relevante, cite referências técnicas (Embrapa, IAC, universidades)
5. Seja prático e objetivo, focando em recomendações acionáveis
6. Use formatação markdown para organizar suas respostas (listas, negrito, tabelas quando apropriado)
7. Se não souber algo com certeza, indique que é uma estimativa e recomende consultar um agrônomo`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agrobrain-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
