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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import type { AdminGroup } from "@/hooks/useAdminGroups";

interface EditGroupAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminGroup | null;
  onSave: (updates: Partial<{
    name: string;
    city: string;
    donation_type: string;
    goal_2026: number;
    is_private: boolean;
    leader_name: string;
    leader_whatsapp: string;
    description: string | null;
    end_date: string | null;
  }>) => void;
  isLoading: boolean;
}

export const EditGroupAdminModal = ({
  open,
  onOpenChange,
  group,
  onSave,
  isLoading,
}: EditGroupAdminModalProps) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [donationType, setDonationType] = useState("");
  const [goal2026, setGoal2026] = useState(0);
  const [isPrivate, setIsPrivate] = useState(true);
  const [leaderName, setLeaderName] = useState("");
  const [leaderWhatsapp, setLeaderWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setCity(group.city || "");
      setDonationType(group.donation_type || "");
      setGoal2026(group.goal_2026 || 0);
      setIsPrivate(group.is_private);
      setLeaderName(group.leader_name || "");
      setLeaderWhatsapp(group.leader_whatsapp || "");
      setDescription(group.description || "");
      setEndDate(group.end_date || "");
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      city,
      donation_type: donationType,
      goal_2026: goal2026,
      is_private: isPrivate,
      leader_name: leaderName,
      leader_whatsapp: leaderWhatsapp,
      description: description || null,
      end_date: endDate || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
          <DialogDescription>
            Atualize as informações do grupo abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <CityAutocomplete value={city} onChange={setCity} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donationType">Tipo de Doação</Label>
            <Input
              id="donationType"
              value={donationType}
              onChange={(e) => setDonationType(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal2026">Meta 2026</Label>
              <Input
                id="goal2026"
                type="number"
                value={goal2026}
                onChange={(e) => setGoal2026(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Limite</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isPrivate">Grupo Privado</Label>
            <Switch
              id="isPrivate"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaderName">Nome do Líder</Label>
            <Input
              id="leaderName"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaderWhatsapp">WhatsApp do Líder</Label>
            <Input
              id="leaderWhatsapp"
              value={leaderWhatsapp}
              onChange={(e) => setLeaderWhatsapp(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
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
