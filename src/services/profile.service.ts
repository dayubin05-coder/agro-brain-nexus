import { supabase } from "@/integrations/supabase/client";

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
  getAvatarPublicUrl: (path: string) =>
    supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl,
};
