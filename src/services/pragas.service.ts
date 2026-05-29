import { supabase } from "@/integrations/supabase/client";

export interface PragaInput {
  fazenda_id?: string;
  nome: string;
  tipo: string;
  severidade: string;
  cultura?: string | null;
  area_afetada?: string | number | null;
  recomendacao?: string | null;
  data_deteccao?: string;
  status?: string;
}

export const pragasService = {
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("pragas_ocorrencias" as any)
      .select("*, fazendas!inner(user_id, nome), talhoes(nome)")
      .eq("fazendas.user_id", userId)
      .order("data_deteccao", { ascending: false });
    if (error) throw error;
    return data as any[];
  },
  create: async (f: PragaInput) => {
    const { error } = await supabase.from("pragas_ocorrencias" as any).insert([
      {
        fazenda_id: f.fazenda_id!,
        nome: String(f.nome).trim(),
        tipo: f.tipo,
        severidade: f.severidade,
        cultura: f.cultura || null,
        area_afetada: f.area_afetada ? Number(f.area_afetada) : null,
        recomendacao: f.recomendacao || null,
        data_deteccao: f.data_deteccao || new Date().toISOString().split("T")[0],
        status: "ativa",
      },
    ] as any);
    if (error) throw error;
  },
  update: async (id: string, item: PragaInput) => {
    const { error } = await supabase
      .from("pragas_ocorrencias" as any)
      .update({
        nome: String(item.nome).trim(),
        tipo: item.tipo,
        severidade: item.severidade,
        status: item.status,
        cultura: item.cultura || null,
        area_afetada: item.area_afetada ? Number(item.area_afetada) : null,
        recomendacao: item.recomendacao || null,
      } as any)
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("pragas_ocorrencias" as any).delete().eq("id", id);
    if (error) throw error;
  },
};
