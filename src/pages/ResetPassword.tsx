import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { Leaf, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we arrived here from a recovery link
    const hashParams = new URLSearchParams(location.hash.substring(1));
    if (hashParams.get("type") !== "recovery" && !hashParams.get("access_token")) {
      toast.error("Link de recuperação inválido ou expirado.");
      navigate("/login");
    }
  }, [location, navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error(t("auth.password.weak"));
      return;
    }
    setLoading(true);
    try {
      await authService.updatePassword(password);
      toast.success(t("auth.password.updated"));
      navigate("/login");
    } catch (error: any) {
      toast.error("Erro ao atualizar a senha: " + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Nova Senha</h1>
          <p className="text-muted-foreground text-sm mt-1">Digite sua nova senha abaixo</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="Mínimo de 6 caracteres"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 mt-6 shadow-glow"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}