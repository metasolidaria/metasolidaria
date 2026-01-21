import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGroupDetails } from "@/hooks/useGroupDetails";

interface CommitmentInfo {
  id: string;
  name: string | null;
  metric: string;
  ratio: number;
  donation_amount: number;
  personal_goal: number;
}

interface AddProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  memberId: string;
  donationType: { label: string; icon: string; unit: string };
  commitment?: CommitmentInfo;
}

export const AddProgressModal = ({
  open,
  onOpenChange,
  groupId,
  memberId,
  donationType,
  commitment,
}: AddProgressModalProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { addProgress } = useGroupDetails(groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addProgress.mutate(
      { 
        memberId, 
        amount: numAmount, 
        description: description.trim() || undefined 
      },
      {
        onSuccess: () => {
          setAmount("");
          setDescription("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {donationType.icon} Registrar Doação
          </DialogTitle>
          <DialogDescription>
            {commitment ? (
              <span>
                Registrando para: <strong>{commitment.name || commitment.metric}</strong>
                <br />
                <span className="text-xs text-muted-foreground">
                  ({commitment.ratio} {commitment.metric} = {commitment.donation_amount} {donationType.unit})
                </span>
              </span>
            ) : (
              "Adicione sua contribuição ao progresso do grupo"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              Quantidade ({donationType.unit})
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder={`Ex: 10 ${donationType.unit}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Doação de alimentos arrecadados na feira"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!amount || addProgress.isPending}
            >
              {addProgress.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};