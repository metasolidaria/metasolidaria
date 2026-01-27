import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import type { AdminUser } from "@/hooks/useAdminUsers";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSave: (updates: { full_name?: string; whatsapp?: string; city?: string | null }) => void;
  isLoading: boolean;
}

export const EditUserModal = ({
  open,
  onOpenChange,
  user,
  onSave,
  isLoading,
}: EditUserModalProps) => {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setWhatsapp(user.whatsapp || "");
      setCity(user.city || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      full_name: fullName,
      whatsapp,
      city: city || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <CityAutocomplete value={city} onChange={setCity} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
