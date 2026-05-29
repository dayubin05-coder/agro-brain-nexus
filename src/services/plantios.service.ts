import { supabase } from "@/integrations/supabase/client";

export interface PlantioInput {
  cultura_id?: string;
  talhao_id?: string;
  area_plantada?: string | number;
  data_plantio?: string;
  previsao_colheita?: string | null;
  variedade?: string | null;
  densidade_plantio?: string | null;
  fertilizacao?: string | null;
  status?: string;
  progresso_percentual?: string | number;
}

export const plantiosService = {
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("plantios")
      .select("*, culturas (nome), talhoes!inner (nome, fazendas!inner (user_id))")
      .eq("talhoes.fazendas.user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (p: PlantioInput) => {
    const { error } = await supabase.from("plantios").insert([
      {
        cultura_id: p.cultura_id!,
        talhao_id: p.talhao_id!,
        area_plantada: Number(p.area_plantada),
        data_plantio: p.data_plantio!,
        previsao_colheita: p.previsao_colheita || null,
        variedade: p.variedade || null,
        densidade_plantio: p.densidade_plantio || null,
        fertilizacao: p.fertilizacao || null,
        status: "plantio",
        progresso_percentual: 0,
      },
    ]);
    if (error) throw error;
  },
  update: async (id: string, item: PlantioInput) => {
    const { error } = await supabase
      .from("plantios")
      .update({
        variedade: item.variedade || null,
        densidade_plantio: item.densidade_plantio || null,
        fertilizacao: item.fertilizacao || null,
        previsao_colheita: item.previsao_colheita || null,
        status: item.status,
        progresso_percentual: Number(item.progresso_percentual) || 0,
      })
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("plantios").delete().eq("id", id);
    if (error) throw error;
  },
};
