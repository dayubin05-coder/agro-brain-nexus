import { supabase } from "@/integrations/supabase/client";

export interface TalhaoInput {
  nome: string;
  area: number | string;
  observacoes?: string | null;
  coordenadas?: any;
}

export const talhoesService = {
  listByFarm: async (farmId: string) => {
    const { data, error } = await supabase
      .from("talhoes")
      .select("*")
      .eq("fazenda_id", farmId)
      .order("nome");
    if (error) throw error;
    return data;
  },
  listAvailableForUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("talhoes")
      .select("id, nome, area, fazendas (nome, user_id)")
      .eq("fazendas.user_id", userId);
    if (error) throw error;
    return (data || []).filter((t: any) => t.fazendas !== null);
  },
  create: async (farmId: string, t: TalhaoInput) => {
    const { error } = await supabase.from("talhoes").insert([
      {
        nome: t.nome,
        area: Number(t.area),
        fazenda_id: farmId,
        observacoes: t.observacoes || null,
        coordenadas: t.coordenadas ?? null,
      },
    ]);
    if (error) throw error;
  },
  createMany: async (farmId: string, items: TalhaoInput[]) => {
    const inserts = items.map((t) => ({
      nome: t.nome,
      area: Number(t.area),
      fazenda_id: farmId,
      coordenadas: t.coordenadas ?? null,
      observacoes: t.observacoes ?? null,
    }));
    const { error } = await supabase.from("talhoes").insert(inserts);
    if (error) throw error;
  },
  update: async (id: string, t: TalhaoInput) => {
    const { error } = await supabase
      .from("talhoes")
      .update({
        nome: t.nome,
        area: Number(t.area),
        observacoes: t.observacoes || null,
      })
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("talhoes").delete().eq("id", id);
    if (error) throw error;
  },
  listDashboardForUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("talhoes")
      .select(`
        id, nome, area, coordenadas, observacoes, fazenda_id,
        fazendas!inner (id, nome, cidade, estado, user_id),
        plantios (id)
      `)
      .eq("fazendas.user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      nome: t.nome,
      area: t.area,
      coordenadas: t.coordenadas,
      observacoes: t.observacoes,
      fazenda_id: t.fazenda_id,
      fazenda_nome: t.fazendas.nome,
      fazenda_cidade: t.fazendas.cidade,
      fazenda_estado: t.fazendas.estado,
      plantios_count: t.plantios?.length || 0,
    }));
  },
};

