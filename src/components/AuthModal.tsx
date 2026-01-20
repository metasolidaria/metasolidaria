import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, User, Phone, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator, validatePasswordStrength } from "./PasswordStrengthIndicator";
import { PasswordInput } from "./PasswordInput";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "signup";
}

export const AuthModal = ({ open, onOpenChange, defaultMode = "login" }: AuthModalProps) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(defaultMode);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    whatsapp: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(formData.email);
        if (error) throw error;
        toast({
          title: "Email enviado! 📧",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        setMode("login");
      } else if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        toast({
          title: "Bem-vindo de volta! 🎉",
          description: "Login realizado com sucesso.",
        });
        onOpenChange(false);
      } else {
        const passwordError = validatePasswordStrength(formData.password);
        if (passwordError) {
          toast({
            title: "Senha inválida",
            description: passwordError,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.whatsapp
        );
        if (error) throw error;
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Você já pode criar grupos e participar da comunidade.",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md">
              <div className="bg-gradient-stats p-6 relative rounded-t-2xl">
                {mode === "forgot" && (
                  <button
                    onClick={() => setMode("login")}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-primary-foreground" />
                  </button>
                )}
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
                <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4">
                  {mode === "forgot" ? (
                    <Mail className="w-7 h-7 text-primary-foreground" />
                  ) : (
                    <User className="w-7 h-7 text-primary-foreground" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  {mode === "login" ? "Entrar" : mode === "signup" ? "Criar Conta" : "Recuperar Senha"}
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  {mode === "login"
                    ? "Acesse sua conta para gerenciar grupos"
                    : mode === "signup"
                    ? "Junte-se à comunidade solidária"
                    : "Digite seu email para receber o link"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {mode === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="fullName"
                          placeholder="Seu nome completo"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          className="pl-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={formData.whatsapp}
                          onChange={(e) =>
                            setFormData({ ...formData, whatsapp: e.target.value })
                          }
                          className="pl-11"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-11"
                      required
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-xs text-primary hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      )}
                    </div>
                    <PasswordInput
                      id="password"
                      value={formData.password}
                      onChange={(value) => setFormData({ ...formData, password: value })}
                      minLength={mode === "signup" ? 8 : 6}
                    />
                    {mode === "signup" && (
                      <PasswordStrengthIndicator password={formData.password} />
                    )}
                  </div>
                )}

                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {mode === "login" ? "Entrar" : mode === "signup" ? "Criar Conta" : "Enviar link de recuperação"}
                </Button>

                {mode !== "forgot" && (
                  <p className="text-center text-sm text-muted-foreground">
                    {mode === "login" ? (
                      <>
                        Não tem conta?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("signup")}
                          className="text-primary font-medium hover:underline"
                        >
                          Criar conta
                        </button>
                      </>
                    ) : (
                      <>
                        Já tem conta?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-primary font-medium hover:underline"
                        >
                          Entrar
                        </button>
                      </>
                    )}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
