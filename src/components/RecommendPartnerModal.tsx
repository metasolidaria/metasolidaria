import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, MapPin, Phone, User, FileText, Loader2, Instagram, UserCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { CityAutocomplete } from "./CityAutocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { partnerSchema, validateForm } from "@/lib/validations";

interface RecommendPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequireAuth?: () => void;
}

const specialties = [
  // Saúde
  { id: "Médico", label: "Médico" },
  { id: "Dentista", label: "Dentista" },
  { id: "Nutricionista", label: "Nutricionista" },
  { id: "Psicólogo", label: "Psicólogo" },
  { id: "Fisioterapeuta", label: "Fisioterapeuta" },
  { id: "Clínica", label: "Clínica" },
  { id: "Farmácia", label: "Farmácia" },
  // Esporte e Bem-estar
  { id: "Personal Trainer", label: "Personal Trainer" },
  { id: "Academia", label: "Academia" },
  { id: "Clube", label: "Clube" },
  // Alimentação
  { id: "Supermercado", label: "Supermercado" },
  { id: "Padaria", label: "Padaria" },
  { id: "Açougue", label: "Açougue" },
  { id: "Restaurante", label: "Restaurante" },
  { id: "Lanchonete", label: "Lanchonete" },
  // Comércio e Varejo
  { id: "Loja de Roupa", label: "Loja de Roupa" },
  { id: "Loja de Calçado", label: "Loja de Calçado" },
  { id: "Comércio", label: "Comércio" },
  // Construção e Imóveis
  { id: "Material de Construção", label: "Material de Construção" },
  { id: "Imobiliária", label: "Imobiliária" },
  { id: "Corretor", label: "Corretor" },
  // Serviços e Empresas
  { id: "Consultor", label: "Consultor" },
  { id: "Empresa", label: "Empresa" },
  { id: "Indústria", label: "Indústria" },
  // Rural
  { id: "Agropecuária", label: "Agropecuária" },
  // Outros
  { id: "Outros", label: "Outros" },
];

export const RecommendPartnerModal = ({
  open,
  onOpenChange,
  onRequireAuth,
}: RecommendPartnerModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    city: "",
    whatsapp: "",
    responsible: "",
    description: "",
    instagram: "",
    referrerName: "",
    referrerPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onRequireAuth?.();
      return;
    }

    // Validate form data
    const validation = validateForm(partnerSchema, {
      name: formData.name,
      city: formData.city,
      specialty: formData.specialty || undefined,
      whatsapp: formData.whatsapp || undefined,
      description: formData.description || undefined,
      instagram: formData.instagram || undefined,
      responsible: formData.responsible || undefined,
    });

    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0];
      toast({
        title: "Dados inválidos",
        description: firstError || "Verifique os campos do formulário",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const description = formData.responsible 
        ? `Responsável: ${formData.responsible.trim()}${formData.description ? `. ${formData.description.trim()}` : ""}`
        : formData.description.trim();

      const { error } = await supabase.from("partners").insert([
        {
          name: formData.name.trim(),
          specialty: formData.specialty || null,
          city: formData.city.trim(),
          whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, "") : null,
          description: description || null,
          submitted_by: user.id,
          is_approved: false,
          tier: "apoiador",
          instagram: formData.instagram ? formData.instagram.replace("@", "").trim() : null,
          referrer_name: formData.referrerName.trim() || null,
          referrer_phone: formData.referrerPhone ? formData.referrerPhone.replace(/\D/g, "") : null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Parceiro recomendado! 🎉",
        description: "Sua indicação será analisada e em breve estará disponível.",
      });

      setFormData({
        name: "",
        specialty: "",
        city: "",
        whatsapp: "",
        responsible: "",
        description: "",
        instagram: "",
        referrerName: "",
        referrerPhone: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar recomendação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                Recomendar Parceiro
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Nome da Empresa/Profissional *
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Clínica Saúde Total"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade (opcional)</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, specialty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Cidade *
                </Label>
                <CityAutocomplete
                  value={formData.city}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, city: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp (opcional)
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                  }
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Responsável
                </Label>
                <Input
                  id="responsible"
                  placeholder="Nome do responsável"
                  value={formData.responsible}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, responsible: e.target.value }))
                  }
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram (opcional)
                </Label>
                <Input
                  id="instagram"
                  placeholder="@usuario"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, instagram: e.target.value }))
                  }
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Breve descrição dos serviços oferecidos..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* Indicado por */}
              <div className="border-t border-border pt-4 mt-4">
                <Label className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <UserCheck className="w-4 h-4" />
                  Indicado por (opcional)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="referrerName" className="text-sm">Nome</Label>
                    <Input
                      id="referrerName"
                      placeholder="Seu nome"
                      value={formData.referrerName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, referrerName: e.target.value }))
                      }
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referrerPhone" className="text-sm">Telefone</Label>
                    <Input
                      id="referrerPhone"
                      placeholder="(11) 99999-9999"
                      value={formData.referrerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, referrerPhone: e.target.value }))
                      }
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
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
                  disabled={isSubmitting || !formData.name || !formData.city}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Enviar Recomendação
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Apenas nome e cidade são obrigatórios. Sua indicação será analisada antes de ser publicada.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
