import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Copy, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string | null;
  groupName?: string;
  groupDescription?: string;
}

export const InviteMemberModal = ({ open, onOpenChange, groupId, groupName, groupDescription }: InviteMemberModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const createLinkInvitation = useMutation({
    mutationFn: async (gId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado");
      }

      const { data, error } = await supabase
        .from("group_invitations")
        .insert([{ 
          group_id: gId, 
          invited_by: user.id,
          invite_type: 'link',
          email: null
        }])
        .select('invite_code')
        .single();

      if (error) throw error;
      return data.invite_code;
    },
  });

  const generateInviteText = (inviteUrl: string) => {
    return groupDescription 
      ? `🎉 Você foi convidado para participar do grupo "${groupName || 'Meta Solidária'}"!\n\n📝 ${groupDescription}\n\n👉 Clique no link para entrar: ${inviteUrl}`
      : `🎉 Você foi convidado para participar do grupo "${groupName || 'Meta Solidária'}" no Meta Solidária!\n\n👉 Clique no link para entrar: ${inviteUrl}`;
  };

  const handleCopyLink = async () => {
    if (!groupId) return;

    try {
      const inviteCode = await createLinkInvitation.mutateAsync(groupId);
      const inviteUrl = `https://metasolidaria.com.br?invite=${inviteCode}`;
      const inviteText = generateInviteText(inviteUrl);
      
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      toast({
        title: "Convite copiado! 📋",
        description: "Compartilhe a mensagem com a pessoa que deseja convidar.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error: any) {
      toast({
        title: "Erro ao gerar link",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = async () => {
    if (!groupId) return;

    try {
      const inviteCode = await createLinkInvitation.mutateAsync(groupId);
      const inviteUrl = `https://metasolidaria.com.br?invite=${inviteCode}`;
      const inviteText = generateInviteText(inviteUrl);
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error: any) {
      toast({
        title: "Erro ao gerar link",
        description: error.message,
        variant: "destructive",
      });
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
                  Compartilhe o link de convite para o grupo
                </p>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-sm text-muted-foreground text-center">
                  Escolha como deseja compartilhar o convite:
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={handleCopyLink}
                    disabled={createLinkInvitation.isPending}
                  >
                    {createLinkInvitation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link de Convite
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleShareWhatsApp}
                    disabled={createLinkInvitation.isPending}
                  >
                    {createLinkInvitation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Compartilhar via WhatsApp
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
