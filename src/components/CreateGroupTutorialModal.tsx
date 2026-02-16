import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

import step0Img from "@/assets/tutorial/step0-botao-criar.jpg";
import step1Img from "@/assets/tutorial/step1-dados-lider.jpg";
import step2Img from "@/assets/tutorial/step2-tipo-doacao.jpg";
import step3Img from "@/assets/tutorial/step3-meta-padrao.jpg";
import step4Img from "@/assets/tutorial/step4-pagina-grupo.jpg";
import step5Img from "@/assets/tutorial/step5-incluir-evolucao.jpg";
import step6Img from "@/assets/tutorial/step6-evolucao-registrada.jpg";

const steps = [
  {
    image: step0Img,
    title: "Encontre o botão \"Criar Grupo\"",
    description:
      "Na tela inicial, toque no botão \"Criar Grupo\" para começar a montar seu grupo de doações.",
  },
  {
    image: step1Img,
    title: "Preencha os dados do líder e do grupo",
    description:
      "Informe o nome do líder, WhatsApp, nome do grupo, uma descrição e adicione uma foto de capa.",
  },
  {
    image: step2Img,
    title: "Escolha a cidade, data e tipo de doação",
    description:
      "Selecione a cidade, defina a data limite e escolha o tipo de doação que o grupo vai arrecadar.",
  },
  {
    image: step3Img,
    title: "Configure a meta padrão e privacidade",
    description:
      "Defina a meta padrão para os membros, escolha se o grupo será privado e se os membros serão visíveis.",
  },
  {
    image: step4Img,
    title: "Adicione membros ou compartilhe convites",
    description:
      "Na página do grupo, use \"Adicionar Membro\" para incluir diretamente ou \"Enviar Convite\" para compartilhar um link.",
  },
  {
    image: step5Img,
    title: "Registre a evolução com \"Incluir Evolução\"",
    description:
      "Toque em \"Incluir Evolução\" para registrar as doações realizadas pelos membros do grupo.",
  },
  {
    image: step6Img,
    title: "Acompanhe o progresso do grupo",
    description:
      "Veja a meta do grupo, o progresso de cada membro e o histórico completo de doações registradas.",
  },
];

interface CreateGroupTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGroupTutorialModal = ({
  open,
  onOpenChange,
}: CreateGroupTutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleOpenChange = (value: boolean) => {
    if (!value) setCurrentStep(0);
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Como Criar e Gerenciar um Grupo
          </DialogTitle>
          <DialogDescription className="text-center">
            Passo {currentStep + 1} de {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            className="h-2"
          />
        </div>

        <div className="mt-4 space-y-4 animate-in fade-in duration-300">
          <img
            src={steps[currentStep].image}
            alt={steps[currentStep].title}
            className="w-full rounded-lg shadow-soft border border-border"
          />

          <div className="text-center space-y-1">
            <h3 className="font-bold text-foreground text-lg">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentStep
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir para passo ${i + 1}`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Fechar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
