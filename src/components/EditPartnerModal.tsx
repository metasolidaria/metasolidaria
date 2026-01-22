import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { Loader2, Gem, Medal, Heart } from "lucide-react";
import type { Partner, PartnerTier } from "@/hooks/usePartners";

interface EditPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onSave: (partner: Partial<Partner> & { id: string }) => void;
  isLoading?: boolean;
}

const tierOptions: { value: PartnerTier; label: string; icon: React.ReactNode }[] = [
  { value: "diamante", label: "Diamante", icon: <Gem className="h-4 w-4 text-cyan-500" /> },
  { value: "ouro", label: "Ouro", icon: <Medal className="h-4 w-4 text-yellow-500" /> },
  { value: "apoiador", label: "Apoiador", icon: <Heart className="h-4 w-4 text-rose-500" /> },
];

export const EditPartnerModal = ({
  open,
  onOpenChange,
  partner,
  onSave,
  isLoading,
}: EditPartnerModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    specialty: "",
    whatsapp: "",
    instagram: "",
    description: "",
    tier: "apoiador" as PartnerTier,
    is_approved: false,
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || "",
        city: partner.city || "",
        specialty: partner.specialty || "",
        whatsapp: partner.whatsapp || "",
        instagram: partner.instagram || "",
        description: partner.description || "",
        tier: partner.tier || "apoiador",
        is_approved: partner.is_approved || false,
      });
    }
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partner) {
      onSave({ id: partner.id, ...formData });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Parceiro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="is_approved" className="font-medium">
                Aprovado
              </Label>
              <p className="text-sm text-muted-foreground">
                Parceiros aprovados aparecem no guia público
              </p>
            </div>
            <Switch
              id="is_approved"
              checked={formData.is_approved}
              onCheckedChange={(checked) => setFormData({ ...formData, is_approved: checked })}
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
