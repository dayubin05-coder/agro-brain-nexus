import { ReactNode } from "react";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { ShieldAlert } from "lucide-react";

interface Props {
  role: AppRole | AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has the required role(s).
 * Admins always pass. Use for UI gating; backend RLS is the source of truth.
 */
export function RequireRole({ role, children, fallback }: Props) {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  if (!hasRole(role)) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <p className="text-sm">Você não tem permissão para acessar este recurso.</p>
        </div>
      )
    );
  }
  return <>{children}</>;
}

export default RequireRole;
