import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Dumbbell, Scale, Footprints, Flame, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const commitmentTypes = [
  { 
    id: 'peso', 
    label: 'Perda de Peso', 
    icon: Scale,
    defaultMetric: 'kg perdido',
  },
  { 
    id: 'gordura', 
    label: 'Redução de Gordura', 
    icon: Flame,
    defaultMetric: '% de gordura reduzido',
  },
  { 
    id: 'exercicio', 
    label: 'Exercício', 
    icon: Dumbbell,
    defaultMetric: 'km corridos',
  },
  { 
    id: 'passos', 
    label: 'Passos', 
    icon: Footprints,
    defaultMetric: 'mil passos',
  },
  { 
    id: 'custom', 
    label: 'Personalizado', 
    icon: Sparkles,
    defaultMetric: '',
  },
];

interface CommitmentData {
  personal_goal: number;
  commitment_type: string | null;
  commitment_metric: string | null;
  commitment_ratio: number;
}

interface EditMemberGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentGoal: number;
  currentCommitmentType?: string | null;
  currentCommitmentMetric?: string | null;
  currentCommitmentRatio?: number | null;
  onSave: (data: CommitmentData) => void;
  isPending?: boolean;
  unit: string;
}

export const EditMemberGoalModal = ({ 
  open, 
  onOpenChange, 
  memberName,
  currentGoal,
  currentCommitmentType,
  currentCommitmentMetric,
  currentCommitmentRatio,
  onSave,
  isPending = false,
  unit
}: EditMemberGoalModalProps) => {
  const [goal, setGoal] = useState(currentGoal.toString());
  const [commitmentType, setCommitmentType] = useState<string>(currentCommitmentType || "");
  const [commitmentMetric, setCommitmentMetric] = useState<string>(currentCommitmentMetric || "");
  const [commitmentRatio, setCommitmentRatio] = useState<string>((currentCommitmentRatio || 1).toString());

  useEffect(() => {
    if (open) {
      setGoal(currentGoal.toString());
      setCommitmentType(currentCommitmentType || "");
      setCommitmentMetric(currentCommitmentMetric || "");
      setCommitmentRatio((currentCommitmentRatio || 1).toString());
    }
  }, [open, currentGoal, currentCommitmentType, currentCommitmentMetric, currentCommitmentRatio]);

  const handleTypeChange = (type: string) => {
    setCommitmentType(type);
    const typeConfig = commitmentTypes.find(t => t.id === type);
    if (typeConfig && typeConfig.defaultMetric) {
      setCommitmentMetric(typeConfig.defaultMetric);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goalValue = parseInt(goal) || 0;
    const ratioValue = parseInt(commitmentRatio) || 1;
    
    onSave({
      personal_goal: goalValue,
      commitment_type: commitmentType || null,
      commitment_metric: commitmentMetric || null,
      commitment_ratio: ratioValue,
    });
  };

  const selectedType = commitmentTypes.find(t => t.id === commitmentType);
  const TypeIcon = selectedType?.icon || Target;

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
                  <TypeIcon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Definir Compromisso
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  Vincule sua meta pessoal a uma doação, {memberName}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Commitment Type */}
                <div className="space-y-2">
                  <Label htmlFor="commitmentType" className="text-foreground font-medium">
                    Tipo de Compromisso
                  </Label>
                  <Select value={commitmentType} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {commitmentTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Commitment Rule - Only show when type is selected */}
                {commitmentType && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
                    <Label className="text-foreground font-medium">
                      Minha Regra de Doação
                    </Label>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-muted-foreground">A cada</span>
                      <Input
                        type="number"
                        value={commitmentRatio}
                        onChange={(e) => setCommitmentRatio(e.target.value)}
                        className="w-16 text-center"
                        min="1"
                      />
                      <Input
                        type="text"
                        value={commitmentMetric}
                        onChange={(e) => setCommitmentMetric(e.target.value)}
                        placeholder="ex: kg perdido"
                        className="flex-1 min-w-[120px]"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">doarei</span>
                      <span className="font-bold text-primary">1 {unit}</span>
                    </div>

                    {/* Preview */}
                    {commitmentMetric && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary font-medium">
                          📌 "{parseInt(commitmentRatio) || 1} {commitmentMetric} = 1 {unit} doado"
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                    {isPending ? "Salvando..." : "Salvar Compromisso"}
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
