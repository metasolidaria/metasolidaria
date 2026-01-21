import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

export interface Commitment {
  id?: string;
  metric: string;
  ratio: number;
  donation_amount: number;
  isNew?: boolean;
}

interface CommitmentData {
  personal_goal: number;
  penalty_donation: number | null;
  commitments: Commitment[];
}

interface EditMemberGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentGoal: number;
  currentCommitments: Commitment[];
  currentPenaltyDonation?: number | null;
  onSave: (data: CommitmentData) => void;
  isPending?: boolean;
  unit: string;
}

export const EditMemberGoalModal = ({ 
  open, 
  onOpenChange, 
  memberName,
  currentGoal,
  currentCommitments,
  currentPenaltyDonation,
  onSave,
  isPending = false,
  unit
}: EditMemberGoalModalProps) => {
  const [goal, setGoal] = useState(currentGoal.toString());
  const [commitments, setCommitments] = useState<Commitment[]>(currentCommitments);
  const [penaltyEnabled, setPenaltyEnabled] = useState<boolean>(!!currentPenaltyDonation);
  const [penaltyDonation, setPenaltyDonation] = useState<string>((currentPenaltyDonation || 0).toString());

  useEffect(() => {
    if (open) {
      setGoal(currentGoal.toString());
      setCommitments(currentCommitments.length > 0 ? currentCommitments : []);
      setPenaltyEnabled(!!currentPenaltyDonation);
      setPenaltyDonation((currentPenaltyDonation || (currentGoal * 2)).toString());
    }
  }, [open, currentGoal, currentCommitments, currentPenaltyDonation]);

  // Atualiza sugestão de penalidade quando meta muda
  useEffect(() => {
    const goalValue = parseInt(goal) || 0;
    if (!currentPenaltyDonation && goalValue > 0) {
      setPenaltyDonation((goalValue * 2).toString());
    }
  }, [goal, currentPenaltyDonation]);

  const addNewCommitment = () => {
    setCommitments([...commitments, { 
      metric: "", 
      ratio: 1, 
      donation_amount: 1,
      isNew: true 
    }]);
  };

  const updateCommitment = (index: number, field: keyof Commitment, value: string | number) => {
    const updated = [...commitments];
    updated[index] = { ...updated[index], [field]: value };
    setCommitments(updated);
  };

  const removeCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goalValue = parseInt(goal) || 0;
    const penaltyValue = penaltyEnabled ? (parseInt(penaltyDonation) || goalValue * 2) : null;
    
    // Filtrar compromissos vazios
    const validCommitments = commitments.filter(c => c.metric.trim() !== "");
    
    onSave({
      personal_goal: goalValue,
      penalty_donation: penaltyValue,
      commitments: validCommitments,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-stats p-6 relative rounded-t-2xl">
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
                <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Definir Compromissos
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  Crie regras de doação personalizadas, {memberName}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-foreground font-medium">
                    Meta de Doação para 2026 ({unit})
                  </Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="goal"
                      type="number"
                      placeholder="Ex: 50"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="pl-11"
                      min="0"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Defina quantos {unit} você pretende doar até 2026
                  </p>
                </div>

                {/* Commitments List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground font-medium">
                      Regras de Doação
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewCommitment}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar Meta
                    </Button>
                  </div>

                  {commitments.length === 0 ? (
                    <div className="text-center py-6 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                      <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma regra definida ainda
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Clique em "Adicionar Meta" para criar suas regras
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {commitments.map((commitment, index) => (
                        <div 
                          key={commitment.id || `new-${index}`}
                          className="p-4 bg-muted/50 rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-primary">
                              META {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCommitment(index)}
                              className="text-destructive hover:text-destructive h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-muted-foreground">A cada</span>
                            <Input
                              type="number"
                              value={commitment.ratio}
                              onChange={(e) => updateCommitment(index, 'ratio', parseInt(e.target.value) || 1)}
                              className="w-14 text-center h-8"
                              min="1"
                            />
                            <Input
                              type="text"
                              value={commitment.metric}
                              onChange={(e) => updateCommitment(index, 'metric', e.target.value)}
                              placeholder="ex: gol, km, kg"
                              className="flex-1 min-w-[100px] h-8"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">doarei</span>
                            <Input
                              type="number"
                              value={commitment.donation_amount}
                              onChange={(e) => updateCommitment(index, 'donation_amount', parseInt(e.target.value) || 1)}
                              className="w-14 text-center h-8"
                              min="1"
                            />
                            <span className="font-medium text-foreground">{unit}</span>
                          </div>

                          {/* Preview */}
                          {commitment.metric && (
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <p className="text-xs text-primary font-medium">
                                📌 "{commitment.ratio} {commitment.metric} = {commitment.donation_amount} {unit}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Penalty Challenge */}
                <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="penaltyEnabled"
                      checked={penaltyEnabled}
                      onCheckedChange={(checked) => setPenaltyEnabled(checked === true)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="penaltyEnabled" className="text-foreground font-medium cursor-pointer flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Aceito o desafio!
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Se eu não bater minha meta pessoal, me comprometo a doar mais
                      </p>
                    </div>
                  </div>

                  {penaltyEnabled && (
                    <div className="flex items-center gap-2 text-sm mt-3 pl-7">
                      <span className="text-muted-foreground">Se não bater a meta, doarei</span>
                      <Input
                        type="number"
                        value={penaltyDonation}
                        onChange={(e) => setPenaltyDonation(e.target.value)}
                        className="w-20 text-center"
                        min="1"
                      />
                      <span className="font-medium text-foreground">{unit}</span>
                    </div>
                  )}

                  {penaltyEnabled && (
                    <div className="p-3 bg-amber-500/10 rounded-lg mt-2">
                      <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                        🔥 Meta: {parseInt(goal) || 0} {unit} → Desafio: {parseInt(penaltyDonation) || 0} {unit} se não bater!
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
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
                    disabled={isPending}
                  >
                    {isPending ? "Salvando..." : "Salvar Compromissos"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};