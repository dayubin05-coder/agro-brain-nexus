import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserFazendas() {
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: fazendas, isLoading } = useQuery({
    queryKey: ["user-fazendas"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fazendas")
        .select("id, nome")
        .eq("user_id", userData!.id)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  return { userData, fazendas: fazendas || [], isLoading };
}
