import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PasswordStrengthIndicator, validatePasswordStrength } from "@/components/PasswordStrengthIndicator";
import { PasswordInput } from "@/components/PasswordInput";

const ResetPassword = () => {
  const { updatePassword, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // If no session after a few seconds, redirect to home
    const timer = setTimeout(() => {
      if (!session) {
        toast({
          title: "Link inválido ou expirado",
          description: "Solicite um novo link de recuperação de senha.",
          variant: "destructive",
        });
        navigate("/");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [session, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "Digite a mesma senha nos dois campos.",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePasswordStrength(formData.password);
    if (passwordError) {
      toast({
        title: "Senha inválida",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(formData.password);
      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: "Senha alterada com sucesso! 🎉",
        description: "Você já pode fazer login com sua nova senha.",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-xl w-full max-w-md p-8 text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Senha Alterada!</h2>
          <p className="text-muted-foreground">Redirecionando para a página inicial...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-card rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="bg-gradient-stats p-6 rounded-t-2xl">
          <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">Nova Senha</h2>
          <p className="text-primary-foreground/80 mt-1">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              minLength={6}
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <PasswordInput
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
              minLength={6}
            />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Alterar Senha
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
