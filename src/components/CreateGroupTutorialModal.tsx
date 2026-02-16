import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const steps = [
  {
    image: "/tutorial/step0-botao-criar.jpg",
    title: "Encontre o botão \"Criar Grupo\"",
    description:
      "Na tela inicial, toque no botão \"Criar Grupo\" para começar a montar seu grupo de doações.",
  },
  {
    image: "/tutorial/step1-dados-lider.jpg",
    title: "Preencha os dados do líder e do grupo",
    description:
      "Informe o nome do líder, WhatsApp, nome do grupo, uma descrição e adicione uma foto de capa.",
  },
  {
    image: "/tutorial/step2-tipo-doacao.jpg",
    title: "Escolha a cidade, data e tipo de doação",
    description:
      "Selecione a cidade, defina a data limite e escolha o tipo de doação que o grupo vai arrecadar.",
  },
  {
    image: "/tutorial/step3-meta-padrao.jpg",
    title: "Configure a meta padrão e privacidade",
    description:
      "Defina a meta padrão para os membros, escolha se o grupo será privado e se os membros serão visíveis.",
  },
  {
    image: "/tutorial/step4-pagina-grupo.jpg",
    title: "Adicione membros ou compartilhe convites",
    description:
      "Na página do grupo, use \"Adicionar Membro\" para incluir diretamente ou \"Enviar Convite\" para compartilhar um link.",
  },
  {
    image: "/tutorial/step5-incluir-evolucao.jpg",
    title: "Registre a evolução com \"Incluir Evolução\"",
    description:
      "Toque em \"Incluir Evolução\" para registrar as doações realizadas pelos membros do grupo.",
  },
  {
    image: "/tutorial/step6-evolucao-registrada.jpg",
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (!value) setCurrentStep(0);
    onOpenChange(value);
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const html2canvas = html2canvasModule.default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;

      for (let i = 0; i < steps.length; i++) {
        if (i > 0) pdf.addPage();

        // Create temporary element for this step
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:-9999px;top:0;width:800px;background:#fff;padding:40px;font-family:system-ui,sans-serif;";
        
        container.innerHTML = `
          <div style="text-align:center;margin-bottom:16px;">
            <span style="background:#2563eb;color:#fff;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;">
              Passo ${i + 1} de ${steps.length}
            </span>
          </div>
          <img src="${steps[i].image}" style="width:100%;border-radius:12px;margin-bottom:20px;" crossorigin="anonymous" />
          <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;text-align:center;color:#1a1a1a;">${steps[i].title}</h2>
          <p style="font-size:16px;color:#555;text-align:center;margin:0;line-height:1.5;">${steps[i].description}</p>
        `;
        document.body.appendChild(container);

        // Wait for image to load
        const img = container.querySelector("img");
        if (img && !img.complete) {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }

        const canvas = await html2canvas(container, { scale: 2, useCORS: true });
        document.body.removeChild(container);

        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        const ratio = canvas.width / canvas.height;
        let w = pageWidth - 20;
        let h = w / ratio;
        if (h > pageHeight - 20) {
          h = pageHeight - 20;
          w = h * ratio;
        }
        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;
        pdf.addImage(imgData, "JPEG", x, y, w, h);
      }

      // On mobile, open in new tab so user can save/share; on desktop, direct download
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const blobUrl = pdf.output("bloburl");
        window.open(blobUrl as unknown as string, "_blank");
        toast.success("PDF aberto em nova aba! Use o botão de compartilhar para salvar.");
      } else {
        pdf.save("tutorial-meta-solidaria.pdf");
        toast.success("PDF baixado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-center flex-1">
              Como Criar e Gerenciar um Grupo
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="ml-2 shrink-0"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
              </span>
            </Button>
          </div>
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
            loading="lazy"
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
