import { useState } from "react";
import { X, Mail, User, Phone, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator, validatePasswordStrength } from "./PasswordStrengthIndicator";
import { PasswordInput } from "./PasswordInput";
import { signupSchema, validateForm } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { CityAutocomplete } from "./CityAutocomplete";
import { lovable } from "@/integrations/lovable/index";

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
    city: "",
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
        
        if (error) {
          // Wait a moment to check if onAuthStateChange updated the session
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify if login actually succeeded despite the error
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Login worked, ignore the error
            toast({
              title: "Bem-vindo de volta! 🎉",
              description: "Login realizado com sucesso.",
            });
            onOpenChange(false);
            setLoading(false);
            return;
          }
          
          // Really failed
          throw error;
        }
        
        toast({
          title: "Bem-vindo de volta! 🎉",
          description: "Login realizado com sucesso.",
        });
        onOpenChange(false);
      } else {
        // Validate signup data
        const validation = validateForm(signupSchema, {
          fullName: formData.fullName,
          email: formData.email,
          whatsapp: formData.whatsapp,
          password: formData.password,
        });

        if (!validation.success) {
          const firstError = Object.values(validation.errors || {})[0];
          toast({
            title: "Dados inválidos",
            description: firstError || "Verifique os campos do formulário",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

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
          formData.email.trim(),
          formData.password,
          formData.fullName.trim(),
          formData.whatsapp.trim(),
          formData.city.trim() || undefined
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

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-card rounded-2xl shadow-xl w-full max-w-md my-auto max-h-[95vh] overflow-y-auto">
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

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <CityAutocomplete
                    value={formData.city}
                    onChange={(value) => setFormData({ ...formData, city: value })}
                    placeholder="Digite sua cidade"
                  />
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
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        toast({
                          title: "Erro ao entrar com Google",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    } catch (err: any) {
                      toast({
                        title: "Erro ao entrar com Google",
                        description: err.message || "Tente novamente",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-black text-white hover:bg-black/90 hover:text-white border-black"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { error } = await lovable.auth.signInWithOAuth("apple", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        toast({
                          title: "Erro ao entrar com Apple",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    } catch (err: any) {
                      toast({
                        title: "Erro ao entrar com Apple",
                        description: err.message || "Tente novamente",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continuar com Apple
                </Button>
              </>
            )}

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

            {mode === "signup" && (
              <p className="text-center text-xs text-muted-foreground">
                Ao criar sua conta, você concorda com nossa{" "}
                <a
                  href="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Política de Privacidade
                </a>
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
};
