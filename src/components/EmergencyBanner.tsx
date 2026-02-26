import { Heart, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const FEATURED_GROUP_ID = "4b4a4e4a-2003-4de0-854b-f3c464592cf3";

export const EmergencyBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-destructive/10 border-b-2 border-destructive/20">
      {/* Animated pulse background */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5 animate-pulse" />
      
      <div className="relative container mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <p className="text-sm sm:text-base font-bold text-destructive">
                Enchentes na Zona da Mata - MG
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Famílias precisam da sua ajuda. Doe agora!
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0 gap-2 shadow-lg hover:scale-105 transition-transform"
            onClick={() => navigate(`/grupo/${FEATURED_GROUP_ID}`)}
          >
            <Heart className="w-4 h-4" fill="currentColor" />
            Doe para as vítimas
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EmergencyBanner;
