import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Phone, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nameSchema } from "@/lib/validations";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

// Brazilian phone regex - accepts formats like (11) 99999-9999, 11999999999, etc.
const brazilianPhoneRegex = /^(\(?[0-9]{2}\)?[\s.-]?)?[0-9]{4,5}[-.\s]?[0-9]{4}$/;

export const AddMemberModal = ({ open, onOpenChange, groupId, groupName }: AddMemberModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<{ name?: string; whatsapp?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; whatsapp?: string } = {};

    // Validate name
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      newErrors.name = nameResult.error.errors[0]?.message;
    }

    // Validate WhatsApp
    if (!whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp é obrigatório";
    } else if (!brazilianPhoneRegex.test(whatsapp.trim())) {
      newErrors.whatsapp = "Formato de telefone inválido. Use (XX) XXXXX-XXXX";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addMember = useMutation({
    mutationFn: async ({ name, whatsapp }: { name: string; whatsapp: string }) => {
      // Normalize WhatsApp (keep only numbers)
      const normalizedWhatsapp = whatsapp.replace(/\D/g, "");

      // Check if member with same WhatsApp already exists in this group
      const { data: existingMember, error: checkError } = await supabase
        .from("group_members")
        .select("id, name")
        .eq("group_id", groupId)
        .ilike("whatsapp", `%${normalizedWhatsapp.slice(-8)}%`)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingMember) {
        throw new Error(`Já existe um membro com este WhatsApp: ${existingMember.name}`);
      }

      // Insert new member without user_id (leader adding directly)
      const { data, error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          name: name.trim(),
          whatsapp: normalizedWhatsapp,
          user_id: null, // Will be linked when user registers
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
      
      toast({
        title: "Membro adicionado! 🎉",
        description: `${data.name} foi incluído no grupo. Quando se cadastrar no app com este WhatsApp, poderá acessar o grupo.`,
      });
      
      // Reset form
      setName("");
      setWhatsapp("");
      setErrors({});
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    addMember.mutate({ name, whatsapp });
  };

  const formatWhatsApp = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    
    // Apply Brazilian phone mask
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setWhatsapp(formatted);
    if (errors.whatsapp) {
      setErrors((prev) => ({ ...prev, whatsapp: undefined }));
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
                  <UserPlus className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Incluir Membro
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  Adicione um membro diretamente ao grupo
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-medium">
                      Nome completo *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nome do membro"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) {
                            setErrors((prev) => ({ ...prev, name: undefined }));
                          }
                        }}
                        className={`pl-11 ${errors.name ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-foreground font-medium">
                      WhatsApp *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={whatsapp}
                        onChange={handleWhatsAppChange}
                        className={`pl-11 ${errors.whatsapp ? "border-destructive" : ""}`}
                        maxLength={16}
                      />
                    </div>
                    {errors.whatsapp && (
                      <p className="text-xs text-destructive">{errors.whatsapp}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Campo chave para identificar o membro quando se cadastrar
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Como funciona:</strong>
                    <br />
                    O membro será adicionado ao grupo "{groupName}". Quando ele se cadastrar no app com este WhatsApp, o grupo já aparecerá automaticamente para ele.
                  </p>
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
                    disabled={addMember.isPending}
                  >
                    {addMember.isPending ? (
                      "Adicionando..."
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Incluir Membro
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
