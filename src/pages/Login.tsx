import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { Leaf, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, resetPasswordSchema } from "@/lib/schemas";
import { t } from "@/lib/i18n";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setLoading(true);
    try {
      await authService.signIn(parsed.data.email, parsed.data.password);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message === "Invalid login credentials" ? t("auth.login.invalid") : t("auth.login.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const parsed = resetPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      toast.warning(parsed.error.issues[0]?.message ?? t("validation.email"));
      return;
    }
    try {
      await authService.resetPasswordForEmail(parsed.data.email);
      toast.success(t("auth.reset.success"));
    } catch {
      toast.error(t("auth.reset.error"));
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Bem-vindo de volta</h1>
          <p className="text-muted-foreground text-sm mt-1">Acesse sua conta no AgroTech</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <button 
                type="button" 
                onClick={handleResetPassword}
                className="text-xs text-primary hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 mt-6 shadow-glow"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem uma conta?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}