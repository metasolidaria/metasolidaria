import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface EditMemberGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentGoal: number;
  onSave: (goal: number) => void;
  isPending?: boolean;
  unit: string;
}

export const EditMemberGoalModal = ({ 
  open, 
  onOpenChange, 
  memberName,
  currentGoal,
  onSave,
  isPending = false,
  unit
}: EditMemberGoalModalProps) => {
  const [goal, setGoal] = useState(currentGoal.toString());

  useEffect(() => {
    if (open) {
      setGoal(currentGoal.toString());
    }
  }, [open, currentGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goalValue = parseInt(goal) || 0;
    onSave(goalValue);
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
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm">
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
                  Definir Meta
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  Meta pessoal de {memberName}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-foreground font-medium">
                    Sua meta para 2026 ({unit})
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
                    {isPending ? "Salvando..." : "Salvar Meta"}
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
