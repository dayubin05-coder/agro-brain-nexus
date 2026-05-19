import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();

    // In a real app, we would fetch context about the user's farm here
    // for example: total area, current crops, weather, etc.
    
    const systemPrompt = `Você é o AgroBrain, um assistente agrícola inteligente altamente especializado. 
    Seu objetivo é ajudar produtores rurais a otimizar sua produção, gerenciar recursos e resolver problemas técnicos.
    
    Conhecimentos específicos:
    - Agronomia brasileira (soja, milho, cana, café, algodão, gado).
    - Diagnóstico de pragas e doenças por descrição ou imagem.
    - Manejo de solo e fertilização (NPK, calagem, gessagem).
    - Climatologia e impacto fenológico.
    - Mercado de commodities (CBOT e B3).
    
    Sempre seja profissional, técnico e prático. Use termos como "talhão", "estágio fenológico", "manejo integrado".
    Se o usuário enviar uma imagem, analise-a com foco agronômico.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
