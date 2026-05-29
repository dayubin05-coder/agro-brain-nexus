import { supabase } from "@/integrations/supabase/client";

export const marketplaceService = {
  listAtivos: async () => {
    const { data, error } = await supabase
      .from("marketplace_anuncios")
      .select("*")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("marketplace_anuncios")
      .select("*, marketplace_propostas(id, valor, status)")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  },
};
