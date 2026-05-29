import { supabase } from "@/integrations/supabase/client";

export interface ProfileUpdateInput {
  nome: string;
  telefone?: string | null;
  tipo?: string | null;
}

export const profileService = {
  getById: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("nome, tipo, avatar_url")
      .eq("id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  /** Versão completa usada na página de Perfil. */
  getFullById: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (userId: string, input: ProfileUpdateInput) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        nome: input.nome,
        telefone: input.telefone ?? null,
        tipo: input.tipo ?? null,
      })
      .eq("id", userId);
    if (error) throw error;
  },

  getAvatarPublicUrl: (path: string) =>
    supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl,

  uploadAvatar: async (userId: string, file: File, previousPath?: string | null) => {
    // Remove o avatar anterior, se existir
    if (previousPath) {
      await supabase.storage.from("avatars").remove([previousPath]);
    }
    const ext = file.name.split(".").pop() || "png";
    const filePath = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", userId);
    if (updateError) throw updateError;

    return filePath;
  },
};
