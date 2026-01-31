import { Download, Share, Plus } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface InstallAppButtonProps {
  variant?: "header" | "footer" | "menu";
  isScrolled?: boolean;
  className?: string;
}

export const InstallAppButton = ({ variant = "header", isScrolled = false, className }: InstallAppButtonProps) => {
  const { isInstallable, isInstalled, isIOSDevice, installApp } = usePWAInstall();
  
  // Não mostrar se já instalou
  if (isInstalled) return null;

  // Determina se precisa mostrar instruções manuais (iOS ou browser sem suporte)
  const needsManualInstructions = isIOSDevice || !isInstallable;

  const handleInstall = async () => {
    if (isInstallable) {
      await installApp();
    }
    // Se não for instalável, o Popover vai controlar as instruções
  };

  // Conteúdo do popover com instruções
  const InstallInstructions = () => (
    <div className="space-y-3 text-sm">
      <p className="font-medium text-foreground">
        {isIOSDevice ? "Como instalar no iPhone/iPad:" : "Como instalar:"}
      </p>
      <div className="space-y-2">
        {isIOSDevice ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</div>
              <span className="flex items-center gap-1">
                Toque em <Share className="w-4 h-4" /> Compartilhar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</div>
              <span className="flex items-center gap-1">
                Toque em <Plus className="w-4 h-4" /> Adicionar à Tela Inicial
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</div>
              <span>Abra este site no Chrome ou Edge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</div>
              <span>Clique no menu ⋮ do navegador</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">3</div>
              <span>Selecione "Instalar aplicativo"</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Variante Header (desktop nav link)
  if (variant === "header") {
    if (needsManualInstructions) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isScrolled ? "text-foreground" : "text-primary-foreground",
                className
              )}
            >
              <Download className="w-4 h-4" />
              Baixar App
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <InstallInstructions />
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <button
        onClick={handleInstall}
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
          isScrolled ? "text-foreground" : "text-primary-foreground",
          className
        )}
      >
        <Download className="w-4 h-4" />
        Baixar App
      </button>
    );
  }

  // Variante Menu (mobile menu item)
  if (variant === "menu") {
    if (needsManualInstructions) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 text-foreground text-left py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors",
                className
              )}
            >
              <Download className="w-4 h-4 text-primary" />
              Baixar App
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <InstallInstructions />
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <button
        onClick={handleInstall}
        className={cn(
          "flex items-center gap-2 text-foreground text-left py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors",
          className
        )}
      >
        <Download className="w-4 h-4 text-primary" />
        Baixar App
      </button>
    );
  }

  // Variante Footer
  if (variant === "footer") {
    if (needsManualInstructions) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
                className
              )}
            >
              <Download className="w-4 h-4" />
              Baixar App
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <InstallInstructions />
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstall}
        className={cn(
          "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
          className
        )}
      >
        <Download className="w-4 h-4" />
        Baixar App
      </Button>
    );
  }

  return null;
};
