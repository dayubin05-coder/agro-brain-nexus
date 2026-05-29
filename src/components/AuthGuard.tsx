import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PUBLIC_ROUTES = ["/login", "/register", "/reset-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.includes(location.pathname);
    if (!session && !isPublic) {
      navigate("/login", { replace: true });
    } else if (session && isPublic) {
      navigate("/", { replace: true });
    }
  }, [session, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
