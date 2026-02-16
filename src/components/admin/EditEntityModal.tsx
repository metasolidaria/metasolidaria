import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { DONATION_OPTIONS } from "@/hooks/useEntities";
import { Phone } from "lucide-react";
import type { AdminEntity } from "@/hooks/useAdminEntities";

interface EditEntityModalProps {
  entity: AdminEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { id: string; name: string; city: string; phone?: string; accepted_donations?: string[]; observations?: string; pix_key?: string; pix_name?: string }) => void;
  isLoading: boolean;
}

export const EditEntityModal = ({
  entity,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: EditEntityModalProps) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedDonations, setAcceptedDonations] = useState<string[]>([]);
  const [observations, setObservations] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixName, setPixName] = useState("");

  useEffect(() => {
    if (entity) {
      setName(entity.name);
      setCity(entity.city);
      setPhone(entity.phone || "");
      setAcceptedDonations(entity.accepted_donations || []);
      setObservations(entity.observations || "");
      setPixKey(entity.pix_key || "");
      setPixName(entity.pix_name || "");
    }
  }, [entity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity) return;
    onSubmit({
      id: entity.id,
      name,
      city,
      phone: phone || undefined,
      accepted_donations: acceptedDonations.length > 0 ? acceptedDonations : undefined,
      observations: observations || undefined,
      pix_key: pixKey || undefined,
      pix_name: pixName || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setCity("");
      setPhone("");
      setAcceptedDonations([]);
      setObservations("");
      setPixKey("");
      setPixName("");
    }
    onOpenChange(newOpen);
  };

  const toggleDonation = (value: string) => {
    setAcceptedDonations((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Instituição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Instituição *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lar das Crianças"
              required
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-city">Cidade *</Label>
            <CityAutocomplete
              value={city}
              onChange={setCity}
              placeholder="Digite o nome da cidade"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Telefone (opcional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="pl-10"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Doações aceitas</Label>
            <div className="grid grid-cols-2 gap-2">
              {DONATION_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`edit-donation-${option.value}`}
                    checked={acceptedDonations.includes(option.value)}
                    onCheckedChange={() => toggleDonation(option.value)}
                  />
                  <Label htmlFor={`edit-donation-${option.value}`} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-pix-key">Chave PIX (opcional)</Label>
            <Input
              id="edit-pix-key"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-pix-name">Nome PIX (opcional)</Label>
            <Input
              id="edit-pix-name"
              value={pixName}
              onChange={(e) => setPixName(e.target.value)}
              placeholder="Nome do titular da chave PIX"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-observations">Observações (opcional)</Label>
            <Textarea
              id="edit-observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Informações adicionais sobre a instituição"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim() || !city.trim()}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
