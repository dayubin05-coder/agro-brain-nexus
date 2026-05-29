import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns the authenticated Supabase user from the AuthContext.
 * Kept for backwards compatibility with existing components.
 */
export function useCurrentUser() {
  const { user, loading } = useAuth();
  return {
    data: user,
    isLoading: loading,
    isFetching: loading,
    error: null as null,
  };
}
