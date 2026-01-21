import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, MapPin, Phone, User, FileText, Loader2 } from "lucide-react";
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

interface RecommendPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequireAuth?: () => void;
}

const specialties = [
  { id: "Nutricionista", label: "Nutricionista" },
  { id: "Médico", label: "Médico" },
  { id: "Psicólogo", label: "Psicólogo" },
  { id: "Personal Trainer", label: "Personal Trainer" },
  { id: "Fisioterapeuta", label: "Fisioterapeuta" },
  { id: "Academia", label: "Academia" },
  { id: "Supermercado", label: "Supermercado" },
  { id: "Comércio", label: "Comércio" },
  { id: "Clínica", label: "Clínica" },
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onRequireAuth?.();
      return;
    }

    if (!formData.name || !formData.city) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Nome e cidade são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const description = formData.responsible 
        ? `Responsável: ${formData.responsible}${formData.description ? `. ${formData.description}` : ""}`
        : formData.description;

      const { error } = await supabase.from("partners").insert([
        {
          name: formData.name.trim(),
          specialty: formData.specialty || null,
          city: formData.city,
          whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, "") : null,
          description: description || null,
          submitted_by: user.id,
          is_approved: false,
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
