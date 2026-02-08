import { useState, useEffect } from "react";
import { X, Target, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

export interface CommitmentBlock {
  id?: string;
  name: string;
  metric: string;
  ratio: number;
  donation_amount: number;
  personal_goal: number;
  penalty_donation: number | null;
  isNew?: boolean;
}

export interface CommitmentData {
  commitments: CommitmentBlock[];
}

interface EditMemberGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentCommitments: CommitmentBlock[];
  onSave: (data: CommitmentData) => void;
  isPending?: boolean;
  unit: string;
}

export const EditMemberGoalModal = ({ 
  open, 
  onOpenChange, 
  memberName,
  currentCommitments,
  onSave,
  isPending = false,
  unit
}: EditMemberGoalModalProps) => {
  const [blocks, setBlocks] = useState<CommitmentBlock[]>([]);

  useEffect(() => {
    if (open) {
      if (currentCommitments && currentCommitments.length > 0) {
        setBlocks(currentCommitments.map(c => ({
          ...c,
          name: c.name || "",
          personal_goal: c.personal_goal || 0,
          penalty_donation: c.penalty_donation || null,
        })));
      } else {
        // Iniciar com um bloco vazio por padrão
        setBlocks([{ 
          name: "Meta 1",
          metric: "", 
          ratio: 1, 
          donation_amount: 1,
          personal_goal: 0,
          penalty_donation: null,
          isNew: true 
        }]);
      }
    }
  }, [open, currentCommitments]);

  const addNewBlock = () => {
    setBlocks([...blocks, { 
      name: `Meta ${blocks.length + 1}`,
      metric: "", 
      ratio: 1, 
      donation_amount: 1,
      personal_goal: 0,
      penalty_donation: null,
      isNew: true 
    }]);
  };

  const updateBlock = (index: number, field: keyof CommitmentBlock, value: string | number | null) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    setBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrar blocos com métrica preenchida e garantir valores mínimos
    const validBlocks = blocks.filter(b => b.metric.trim() !== "").map(b => ({
      ...b,
      name: b.name || `Meta de ${b.metric}`,
      ratio: b.ratio || 1, // Mínimo 1
      donation_amount: b.donation_amount || 1, // Mínimo 1
      personal_goal: b.personal_goal || 0,
      penalty_donation: b.penalty_donation || null,
    }));
    
    onSave({ commitments: validBlocks });
  };

  // Calcula o total de metas de todos os blocos
  const totalGoal = blocks.reduce((sum, b) => sum + (b.personal_goal || 0), 0);
  const totalPenalty = blocks.reduce((sum, b) => sum + (b.penalty_donation || 0), 0);

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300"
      >
        <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
              Crie blocos de metas independentes, {memberName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Blocks List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-medium">
                  Blocos de Metas
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewBlock}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Meta
                </Button>
              </div>

              {blocks.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                  <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Nenhum bloco de meta definido
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                    Clique em "Adicionar Meta" para criar suas metas de doação
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <div 
                      key={block.id || `new-${index}`}
                      className="p-4 bg-muted/50 rounded-xl space-y-4 border border-border"
                    >
                      {/* Block Header */}
                      <div className="flex items-center justify-between">
                        <Input
                          type="text"
                          value={block.name}
                          onChange={(e) => updateBlock(index, 'name', e.target.value)}
                          placeholder={`Meta ${index + 1}`}
                          className="font-semibold text-primary bg-transparent border-none p-0 h-auto text-sm focus-visible:ring-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlock(index)}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Goal */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Meta de Doação ({unit})
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={block.personal_goal === 0 ? "" : block.personal_goal}
                            onChange={(e) => updateBlock(index, 'personal_goal', e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                            placeholder="Ex: 10"
                            className="w-24 h-9"
                            min="0"
                          />
                          <span className="text-sm text-muted-foreground">{unit}</span>
                        </div>
                      </div>
                      
                      {/* Rule */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Regra de Doação
                        </Label>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted-foreground">A cada</span>
                          <Input
                            type="number"
                            value={block.ratio === 0 ? "" : block.ratio}
                            onChange={(e) => updateBlock(index, 'ratio', e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                            placeholder="1"
                            className="w-14 text-center h-9"
                            min="1"
                          />
                          <Input
                            type="text"
                            value={block.metric}
                            onChange={(e) => updateBlock(index, 'metric', e.target.value)}
                            placeholder="ex: gol, km, kg"
                            className="flex-1 min-w-[100px] h-9"
                          />
                          <span className="text-muted-foreground">=</span>
                          <Input
                            type="number"
                            value={block.donation_amount === 0 ? "" : block.donation_amount}
                            onChange={(e) => updateBlock(index, 'donation_amount', e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                            placeholder="1"
                            className="w-14 text-center h-9"
                            min="1"
                          />
                          <span className="font-medium text-foreground">{unit}</span>
                        </div>
                      </div>

                      {/* Preview Rule */}
                      {block.metric && (
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <p className="text-xs text-primary font-medium">
                            📌 "{block.ratio} {block.metric} = {block.donation_amount} {unit}"
                          </p>
                        </div>
                      )}

                      {/* Challenge/Penalty */}
                      <div className="space-y-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={`penalty-${index}`}
                            checked={block.penalty_donation !== null && block.penalty_donation > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateBlock(index, 'penalty_donation', (block.personal_goal || 10) * 2);
                              } else {
                                updateBlock(index, 'penalty_donation', null);
                              }
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`penalty-${index}`} className="text-xs font-medium cursor-pointer flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              Aceito o desafio!
                            </Label>
                          </div>
                        </div>

                        {block.penalty_donation !== null && block.penalty_donation > 0 && (
                          <div className="flex items-center gap-2 text-xs mt-2 pl-5">
                            <span className="text-muted-foreground">Se não bater, doarei</span>
                            <Input
                              type="number"
                              value={block.penalty_donation || ""}
                              onChange={(e) => updateBlock(index, 'penalty_donation', parseInt(e.target.value) || 0)}
                              className="w-16 text-center h-7 text-xs"
                              min="1"
                            />
                            <span className="font-medium text-foreground">{unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {blocks.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Resumo Total</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meta de Doação:</span>
                  <span className="font-bold text-primary">{totalGoal} {unit}</span>
                </div>
                {totalPenalty > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desafio Total:</span>
                    <span className="font-bold text-amber-600">{totalPenalty} {unit}</span>
                  </div>
                )}
              </div>
            )}

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
      </div>
    </>
  );
};
