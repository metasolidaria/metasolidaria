import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Lock, Globe, User, Phone, FileText, CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { CityAutocomplete } from "./CityAutocomplete";
import { EntitySelect } from "./EntitySelect";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequireAuth: () => void;
}

const donationTypes = [
  { id: "alimentos", label: "Alimentos (kg)", icon: "🍎" },
  { id: "livros", label: "Livros (unidades)", icon: "📚" },
  { id: "roupas", label: "Roupas (peças)", icon: "👕" },
  { id: "cobertores", label: "Cobertores (unidades)", icon: "🛏️" },
  { id: "sopas", label: "Sopas (porções)", icon: "🍲" },
  { id: "brinquedos", label: "Brinquedos (unidades)", icon: "🧸" },
  { id: "higiene", label: "Kits de Higiene (unidades)", icon: "🧴" },
  { id: "outro", label: "Outro", icon: "📦" },
];

export const CreateGroupModal = ({ open, onOpenChange, onRequireAuth }: CreateGroupModalProps) => {
  const { user } = useAuth();
  const { createGroup } = useGroups();
  const [formData, setFormData] = useState({
    groupName: "",
    city: "",
    donationType: "",
    isPrivate: true,
    leaderName: "",
    leaderWhatsapp: "",
    description: "",
    endDate: new Date("2026-12-31"),
    entityId: null as string | null,
  });

  // Buscar perfil do usuário para preencher nome e WhatsApp automaticamente
  useEffect(() => {
    if (open && !user) {
      onOpenChange(false);
      onRequireAuth();
      return;
    }

    const fetchProfile = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, whatsapp")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          leaderName: profile.full_name || "",
          leaderWhatsapp: profile.whatsapp || "",
        }));
      }
    };

    if (open && user) {
      fetchProfile();
    }
  }, [open, user, onOpenChange, onRequireAuth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onRequireAuth();
      return;
    }

    createGroup.mutate({
      name: formData.groupName,
      city: formData.city,
      donation_type: formData.donationType,
      goal_2026: 0,
      leader_id: user.id,
      is_private: formData.isPrivate,
      leader_name: formData.leaderName,
      leader_whatsapp: formData.leaderWhatsapp,
      description: formData.description,
      end_date: format(formData.endDate, "yyyy-MM-dd"),
      entity_id: formData.entityId,
    });

    setFormData({ 
      groupName: "", 
      city: "", 
      donationType: "",
      isPrivate: false,
      leaderName: "",
      leaderWhatsapp: "",
      description: "",
      endDate: new Date("2026-12-31"),
      entityId: null,
    });
    onOpenChange(false);
  };

  if (!user) return null;

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
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          >
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md my-auto max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col">
              <div className="bg-gradient-stats p-6 relative rounded-t-2xl">
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
                <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Criar Novo Grupo
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  Inicie uma jornada de transformação coletiva
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaderName" className="text-foreground font-medium">
                      Nome do Líder
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="leaderName"
                        placeholder="Seu nome completo"
                        value={formData.leaderName}
                        onChange={(e) =>
                          setFormData({ ...formData, leaderName: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderWhatsapp" className="text-foreground font-medium">
                      WhatsApp do Líder
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="leaderWhatsapp"
                        placeholder="(11) 99999-9999"
                        value={formData.leaderWhatsapp}
                        onChange={(e) =>
                          setFormData({ ...formData, leaderWhatsapp: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupName" className="text-foreground font-medium">
                      Nome do Grupo
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="groupName"
                        placeholder="Ex: Equipe Solidária"
                        value={formData.groupName}
                        onChange={(e) =>
                          setFormData({ ...formData, groupName: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground font-medium">
                      Descrição do Grupo
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Textarea
                        id="description"
                        placeholder="Descreva o propósito e objetivo do seu grupo..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="pl-11 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground font-medium">
                      Cidade
                    </Label>
                    <CityAutocomplete
                      value={formData.city}
                      onChange={(value) => setFormData({ ...formData, city: value })}
                      placeholder="Digite o nome da cidade"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Data de Finalização das Metas
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? (
                            format(formData.endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Até quando os membros devem cumprir suas metas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Tipo de Doação
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {donationTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, donationType: type.id })
                          }
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                            formData.donationType === type.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-xl">{type.icon}</span>
                          <span className="text-sm font-medium text-foreground">
                            {type.label.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <EntitySelect
                    value={formData.entityId}
                    onChange={(entityId) => setFormData({ ...formData, entityId })}
                  />

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      {formData.isPrivate ? (
                        <Lock className="w-5 h-5 text-secondary" />
                      ) : (
                        <Globe className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <Label className="text-foreground font-medium">
                          {formData.isPrivate ? "Grupo Privado" : "Grupo Público"}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {formData.isPrivate 
                            ? "Apenas convidados podem participar" 
                            : "Qualquer pessoa pode participar"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPrivate: checked })
                      }
                    />
                  </div>
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
                    disabled={!formData.donationType || createGroup.isPending}
                  >
                    {createGroup.isPending ? "Criando..." : "Criar Grupo"}
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
