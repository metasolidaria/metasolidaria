import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { DONATION_OPTIONS } from "@/hooks/useEntities";
import { Phone } from "lucide-react";

interface CreateEntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; city: string; phone?: string; accepted_donations?: string[]; observations?: string; pix_key?: string; pix_name?: string }) => void;
  isLoading: boolean;
}

export const CreateEntityModal = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateEntityModalProps) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedDonations, setAcceptedDonations] = useState<string[]>([]);
  const [observations, setObservations] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixName, setPixName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
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
          <DialogTitle>Nova Instituição Beneficente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Instituição *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lar das Crianças"
              required
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <CityAutocomplete
              value={city}
              onChange={setCity}
              placeholder="Digite o nome da cidade"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
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
                    id={`create-donation-${option.value}`}
                    checked={acceptedDonations.includes(option.value)}
                    onCheckedChange={() => toggleDonation(option.value)}
                  />
                  <Label htmlFor={`create-donation-${option.value}`} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix-key">Chave PIX (opcional)</Label>
            <Input
              id="pix-key"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix-name">Nome PIX (opcional)</Label>
            <Input
              id="pix-name"
              value={pixName}
              onChange={(e) => setPixName(e.target.value)}
              placeholder="Nome do titular da chave PIX"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações (opcional)</Label>
            <Textarea
              id="observations"
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
              {isLoading ? "Salvando..." : "Criar Instituição"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
