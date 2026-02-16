import { Users, Scale, Apple, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const steps = [
  {
    icon: Users,
    title: "Crie ou Entre em um Grupo",
    description:
      "Forme uma equipe com amigos, família ou colegas de trabalho. O líder cadastra nome e WhatsApp.",
  },
  {
    icon: Scale,
    title: "Escolha o Tipo de Doação",
    description:
      "Alimentos, livros, roupas, cobertores, sopas... Escolha a causa que mais faz sentido para seu grupo.",
  },
  {
    icon: Apple,
    title: "Registre seu Progresso",
    description:
      "A cada meta alcançada, registre no app. O sistema calcula automaticamente sua contribuição.",
  },
  {
    icon: Heart,
    title: "Faça a Diferença",
    description:
      "Suas metas pessoais se transformam em doações reais. O grupo é responsável por organizar e entregar as doações para quem precisa. Todos ganham!",
  },
];

interface HowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HowItWorksModal = ({ open, onOpenChange }: HowItWorksModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Como Funciona
          </DialogTitle>
          <DialogDescription className="text-center">
            Um processo simples para transformar suas metas pessoais em impacto
            coletivo
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-4 bg-muted rounded-xl animate-in fade-in slide-in-from-left-4 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-gradient-stats w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <step.icon className="w-6 h-6 text-primary-foreground" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-xs">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
