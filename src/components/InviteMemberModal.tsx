import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Copy, Check, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string | null;
}

export const InviteMemberModal = ({ open, onOpenChange, groupId }: InviteMemberModalProps) => {
  const { inviteToGroup } = useGroups();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupId || !email) return;

    inviteToGroup.mutate({ groupId, email });
    setEmail("");
    onOpenChange(false);
  };

  const handleCopyLink = () => {
    const baseUrl = "https://metasolidaria.com.br";
    const inviteUrl = `${baseUrl}?join=${groupId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({
      title: "Link copiado! 📋",
      description: "Compartilhe o link com a pessoa que deseja convidar.",
    });
    setTimeout(() => setCopied(false), 2000);
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
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
                <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Convidar Membro
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  Envie um convite para o grupo privado
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Email do convidado
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O convite será registrado para este email
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Link Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link de Convite
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="flex-1"
                    disabled={!email || inviteToGroup.isPending}
                  >
                    {inviteToGroup.isPending ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Convite
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
