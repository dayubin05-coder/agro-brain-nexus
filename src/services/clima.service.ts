import { supabase } from "@/integrations/supabase/client";

export const climaService = {
  listFazendasComCoords: async (userId: string) => {
    const { data, error } = await supabase
      .from("fazendas")
      .select("id, nome, latitude, longitude, cidade, estado")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  },
  fetchWeather: async (latitude: number, longitude: number) => {
    const { data, error } = await supabase.functions.invoke("weather", {
      body: { latitude, longitude },
    });
    if (error) throw error;
    return data;
  },
};
