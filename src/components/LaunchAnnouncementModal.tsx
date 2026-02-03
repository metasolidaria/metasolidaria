import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LAUNCH_SEEN_KEY = "launch-announcement-seen";

export const LaunchAnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LAUNCH_SEEN_KEY)) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(LAUNCH_SEEN_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <img 
            src="/logo.jpg" 
            alt="Meta Solidária" 
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
          <DialogTitle className="text-2xl font-bold text-center">
            LANÇAMENTO OFICIAL
          </DialogTitle>
          <div className="text-4xl font-extrabold text-primary my-4">
            07/02/2026
          </div>
          <DialogDescription className="text-base text-center">
            Estamos chegando! Prepare-se para fazer parte da maior rede de
            solidariedade do Brasil.
          </DialogDescription>
          <img 
            src="/mascote-meta-solidaria.png" 
            alt="Mascote Meta Solidária" 
            className="w-28 h-auto mx-auto mt-4"
          />
        </DialogHeader>
        <Button onClick={handleClose} size="lg" className="mt-4 w-full">
          Entendi!
        </Button>
      </DialogContent>
    </Dialog>
  );
};
