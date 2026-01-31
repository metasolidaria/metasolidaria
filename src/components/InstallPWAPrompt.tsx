import { useState, useEffect, forwardRef } from 'react';
import { Download, X, Share, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const DISMISSED_KEY = 'pwa-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

const isSafari = () => {
  return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
};

export const InstallPWAPrompt = forwardRef<HTMLDivElement>((_, ref) => {
  const { isInstallable, isInstalled, isIOSDevice, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      handleDismiss();
    } else {
      // Show manual instructions if native prompt failed
      setShowManualInstructions(true);
    }
  };

  // Don't show if already installed or dismissed
  // On iOS, we show even without isInstallable since beforeinstallprompt never fires
  const shouldRender = !isInstalled && !isDismissed && (isInstallable || isIOSDevice);
  
  if (!shouldRender) {
    return null;
  }

  // Show manual instructions when:
  // - Is iOS (always needs manual instructions)
  // - Or native prompt isn't available
  // - Or user clicked install and it failed
  const shouldShowManual = isIOSDevice || !isInstallable || showManualInstructions;
  const isAndroidDevice = isAndroid();

  return (
    <div ref={ref} className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Instalar Meta Solidária
            </h3>
            
            {shouldShowManual ? (
              <div className="text-muted-foreground text-xs mt-1 space-y-2">
                {isIOSDevice ? (
                  <>
                    <p className="flex items-center gap-1">
                      Toque em <Share className="w-3 h-3 inline" /> <strong>Compartilhar</strong> e depois em <strong>"Adicionar à Tela Inicial"</strong>
                    </p>
                  </>
                ) : isAndroidDevice ? (
                  <>
                    <p className="flex items-center gap-1">
                      Toque em <MoreVertical className="w-3 h-3 inline" /> <strong>Menu</strong> e depois em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
                    </p>
                  </>
                ) : (
                  <p>
                    Use o menu do navegador para adicionar à tela inicial.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs mt-0.5">
                Acesse o app direto da sua tela inicial, sem precisar do navegador.
              </p>
            )}
            
            <div className="flex gap-2 mt-3">
              {!shouldShowManual && (
                <Button 
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1"
                >
                  Instalar App
                </Button>
              )}
              <Button 
                onClick={handleDismiss}
                variant={shouldShowManual ? "default" : "ghost"}
                size="sm"
                className={shouldShowManual ? "flex-1" : "px-2"}
              >
                {shouldShowManual ? "Entendi" : <X className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InstallPWAPrompt.displayName = 'InstallPWAPrompt';
