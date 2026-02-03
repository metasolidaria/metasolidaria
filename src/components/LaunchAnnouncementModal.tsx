import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

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
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            LANÇAMENTO OFICIAL
          </DialogTitle>
          <div className="text-4xl font-extrabold text-primary my-4">
            07/02/2025
          </div>
          <DialogDescription className="text-base text-center">
            Estamos chegando! Prepare-se para fazer parte da maior rede de
            solidariedade do Brasil.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleClose} size="lg" className="mt-4 w-full">
          Entendi!
        </Button>
      </DialogContent>
    </Dialog>
  );
};
