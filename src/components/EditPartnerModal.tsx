import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { SpecialtySelect } from "@/components/SpecialtySelect";
import { Loader2, Gem, Medal, Heart, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, parseLocalDate } from "@/lib/utils";
import type { Partner, PartnerTier } from "@/hooks/usePartners";

interface EditPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onSave: (partner: Partial<Partner> & { id: string }) => void;
  isLoading?: boolean;
}

const tierOptions: { value: PartnerTier; label: string; icon: React.ReactNode }[] = [
  { value: "premium", label: "Premium", icon: <Gem className="h-4 w-4 text-cyan-500" /> },
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
    cep: "",
    latitude: "" as string,
    longitude: "" as string,
    specialty: "",
    whatsapp: "",
    instagram: "",
    description: "",
    tier: "apoiador" as PartnerTier,
    is_approved: false,
    expires_at: null as Date | null,
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || "",
        city: partner.city || "",
        cep: partner.cep || "",
        latitude: partner.latitude != null ? String(partner.latitude) : "",
        longitude: partner.longitude != null ? String(partner.longitude) : "",
        specialty: partner.specialty || "",
        whatsapp: partner.whatsapp || "",
        instagram: partner.instagram || "",
        description: partner.description || "",
        tier: partner.tier || "apoiador",
        is_approved: partner.is_approved || false,
        expires_at: partner.expires_at ? parseLocalDate(partner.expires_at) : null,
      });
    }
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partner) {
      onSave({ 
        id: partner.id, 
        name: formData.name,
        city: formData.city,
        cep: formData.cep || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        specialty: formData.specialty,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        description: formData.description,
        tier: formData.tier,
        is_approved: formData.is_approved,
        expires_at: formData.expires_at ? format(formData.expires_at, "yyyy-MM-dd") : null,
      });
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <CityAutocomplete
                value={formData.city}
                onChange={(city) => setFormData({ ...formData, city })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-23.5505"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-46.6333"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <SpecialtySelect
              value={formData.specialty}
              onChange={(specialty) => setFormData({ ...formData, specialty })}
              placeholder="Selecione a especialidade"
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
            <Label>Data de Expiração</Label>
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
