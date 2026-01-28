import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { Loader2, Gem, Medal, Heart, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { PartnerTier } from "@/hooks/usePartners";

interface CreatePartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (partner: {
    name: string;
    city: string;
    specialty?: string;
    whatsapp?: string;
    instagram?: string;
    description?: string;
    tier?: PartnerTier;
    is_approved?: boolean;
    expires_at?: string | null;
  }) => void;
  isLoading?: boolean;
}

const tierOptions: { value: PartnerTier; label: string; icon: React.ReactNode }[] = [
  { value: "diamante", label: "Diamante", icon: <Gem className="h-4 w-4 text-cyan-500" /> },
  { value: "ouro", label: "Ouro", icon: <Medal className="h-4 w-4 text-yellow-500" /> },
  { value: "apoiador", label: "Apoiador", icon: <Heart className="h-4 w-4 text-rose-500" /> },
];

export const CreatePartnerModal = ({
  open,
  onOpenChange,
  onCreate,
  isLoading,
}: CreatePartnerModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    specialty: "",
    whatsapp: "",
    instagram: "",
    description: "",
    tier: "apoiador" as PartnerTier,
    expires_at: null as Date | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      is_approved: true,
      expires_at: formData.expires_at ? format(formData.expires_at, "yyyy-MM-dd") : null,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      specialty: "",
      whatsapp: "",
      instagram: "",
      description: "",
      tier: "apoiador",
      expires_at: null,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Parceiro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do parceiro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <CityAutocomplete
              value={formData.city}
              onChange={(city) => setFormData({ ...formData, city })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Ex: Nutricionista, Personal Trainer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Nível do Parceiro</Label>
            <Select
              value={formData.tier}
              onValueChange={(value: PartnerTier) => setFormData({ ...formData, tier: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tierOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o parceiro..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Data de Expiração (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expires_at && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expires_at
                    ? format(formData.expires_at, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expires_at || undefined}
                  onSelect={(date) => setFormData({ ...formData, expires_at: date || null })}
                  initialFocus
                  className="pointer-events-auto"
                />
                {formData.expires_at && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={() => setFormData({ ...formData, expires_at: null })}
                    >
                      Remover data
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <p className="text-sm text-muted-foreground">
            * O parceiro será cadastrado já aprovado e visível no guia.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !formData.name || !formData.city}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
