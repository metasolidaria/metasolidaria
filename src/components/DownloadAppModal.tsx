import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Download, Smartphone } from "lucide-react";

interface DownloadAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const AndroidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.463 11.463 0 00-8.94 0L5.65 5.67c-.19-.29-.54-.38-.84-.22-.3.16-.42.54-.26.85L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
  </svg>
);

export const DownloadAppModal = ({ open, onOpenChange }: DownloadAppModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="w-5 h-5 text-primary" />
            Como Baixar o App
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* iPhone / iPad */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                <AppleIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">iPhone / iPad</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Abra o site <strong className="text-foreground">metasolidaria.com.br</strong> no Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Toque no botão de <strong className="text-foreground">Compartilhar</strong> (ícone de quadrado com seta para cima)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Role para baixo e toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">4</span>
                <span>Toque em <strong className="text-foreground">"Adicionar"</strong> e pronto!</span>
              </li>
            </ol>
          </div>

          {/* Android */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <AndroidIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Android</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600 text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Abra o site <strong className="text-foreground">metasolidaria.com.br</strong> no Chrome</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600 text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Toque no menu <strong className="text-foreground">⋮</strong> (três pontinhos no canto superior)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600 text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Toque em <strong className="text-foreground">"Instalar aplicativo"</strong> ou <strong className="text-foreground">"Adicionar à tela inicial"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600 text-xs font-bold shrink-0 mt-0.5">4</span>
                <span>Confirme e o app aparecerá na sua tela!</span>
              </li>
            </ol>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            <Smartphone className="w-3 h-3 inline mr-1" />
            O app funciona offline e recebe atualizações automáticas
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
