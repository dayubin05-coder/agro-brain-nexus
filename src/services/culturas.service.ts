import { supabase } from "@/integrations/supabase/client";

export const culturasService = {
  listAll: async () => {
    const { data, error } = await supabase.from("culturas").select("*").order("nome");
    if (error) throw error;
    return data;
  },
};
