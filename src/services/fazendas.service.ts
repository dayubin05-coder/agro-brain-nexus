import { supabase } from "@/integrations/supabase/client";

export interface FazendaInput {
  nome: string;
  cidade?: string;
  estado?: string;
  area_total: string | number;
}

export const fazendasService = {
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("fazendas")
      .select(`*, talhoes (id, nome, area, coordenadas)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (userId: string, f: FazendaInput) => {
    const { error } = await supabase.from("fazendas").insert([
      {
        nome: f.nome,
        cidade: f.cidade,
        estado: f.estado,
        area_total: Number(f.area_total),
        user_id: userId,
      },
    ]);
    if (error) throw error;
  },
  update: async (id: string, f: FazendaInput) => {
    const { error } = await supabase
      .from("fazendas")
      .update({
        nome: f.nome,
        cidade: f.cidade,
        estado: f.estado,
        area_total: Number(f.area_total),
      })
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("fazendas").delete().eq("id", id);
    if (error) throw error;
  },
};
