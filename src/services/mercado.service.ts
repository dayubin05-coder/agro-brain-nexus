import { supabase } from "@/integrations/supabase/client";

export interface Commodity {
  nome: string;
  preco: string;
  variacao: string;
  tipo: string;
  tendencia: string;
  previsao: string;
}

export interface CommodityData {
  commodities: Commodity[];
  historico: Record<string, { data: string; preco: number }[]>;
  updatedAt: string;
}

export const mercadoService = {
  fetchPrices: async (): Promise<CommodityData> => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commodity-prices`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch prices");
    return res.json();
  },
};
