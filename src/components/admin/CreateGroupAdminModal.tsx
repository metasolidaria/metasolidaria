import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2, Lock, Globe, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const donationTypes = [
  { id: "alimentos", label: "Alimentos (kg)" },
  { id: "livros", label: "Livros (unidades)" },
  { id: "roupas", label: "Roupas (peças)" },
  { id: "cobertores", label: "Cobertores (unidades)" },
  { id: "sopas", label: "Sopas (porções)" },
  { id: "brinquedos", label: "Brinquedos (unidades)" },
  { id: "higiene", label: "Kits de Higiene (unidades)" },
  { id: "racao", label: "Ração (kg)" },
  { id: "mudas", label: "Mudas de Árvore (unidades)" },
  { id: "sangue", label: "Doador de Sangue (doações)" },
  { id: "ovos_pascoa", label: "Ovos de Páscoa (unidades)" },
  { id: "dinheiro", label: "Dinheiro (R$)" },
  { id: "outro", label: "Outro" },
];

export const CreateGroupAdminModal = ({
  open,
  onOpenChange,
}: CreateGroupAdminModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    donationType: "",
    isPrivate: true,
    membersVisible: true,
    leaderName: "",
    leaderWhatsapp: "",
    description: "",
    endDate: new Date("2026-12-31"),
    goal2026: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      donationType: "",
      isPrivate: true,
      membersVisible: true,
      leaderName: "",
      leaderWhatsapp: "",
      description: "",
      endDate: new Date("2026-12-31"),
      goal2026: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.city.trim() || !formData.donationType) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, cidade e tipo de doação",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("create_group_with_leader", {
        _name: formData.name.trim(),
        _city: formData.city.trim(),
        _donation_type: formData.donationType,
        _goal_2026: formData.goal2026,
        _is_private: formData.isPrivate,
        _leader_name: formData.leaderName.trim() || "Administrador",
        _leader_whatsapp: formData.leaderWhatsapp.trim() || "",
        _description: formData.description.trim() || "",
        _end_date: format(formData.endDate, "yyyy-MM-dd"),
      });

      if (error) throw error;

      toast({
        title: "Grupo criado",
        description: "O grupo foi criado com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao criar grupo",
        description: error.message || "Não foi possível criar o grupo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input
              id="name"
              placeholder="Ex: Equipe Solidária"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <CityAutocomplete
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              placeholder="Digite o nome da cidade"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Doação *</Label>
            <Select
              value={formData.donationType}
              onValueChange={(value) => setFormData({ ...formData, donationType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {donationTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Meta 2026</Label>
            <Input
              id="goal"
              type="number"
              min={0}
              placeholder="0"
              value={formData.goal2026 || ""}
              onChange={(e) =>
                setFormData({ ...formData, goal2026: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Data de Finalização</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate
                    ? format(formData.endDate, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {formData.isPrivate ? (
                <Lock className="h-4 w-4 text-yellow-600" />
              ) : (
                <Globe className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm font-medium">
                {formData.isPrivate ? "Grupo Privado" : "Grupo Público"}
              </span>
            </div>
            <Switch
              checked={formData.isPrivate}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPrivate: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">
                  {formData.membersVisible ? "Membros Visíveis" : "Membros Ocultos"}
                </span>
                <p className="text-xs text-muted-foreground">
                  {formData.membersVisible ? "Todos podem ver a lista" : "Apenas o líder vê a lista"}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.membersVisible}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, membersVisible: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaderName">Nome do Líder</Label>
            <Input
              id="leaderName"
              placeholder="Nome do líder"
              value={formData.leaderName}
              onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaderWhatsapp">WhatsApp do Líder</Label>
            <Input
              id="leaderWhatsapp"
              placeholder="(11) 99999-9999"
              value={formData.leaderWhatsapp}
              onChange={(e) => setFormData({ ...formData, leaderWhatsapp: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito do grupo..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Grupo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
