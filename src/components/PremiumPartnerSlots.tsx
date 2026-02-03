import { Star, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

const naturuaiLogo = "/naturuai-logo.jpg";
const logoImage = "/logo.jpg";

// Hook to fetch ALL premium and gold partners (national scope)
const useAllPremiumAndGoldPartners = () => {
  return useQuery({
    queryKey: ["allPremiumGoldPartnersSlots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_public")
        .select("id, name, logo_url, specialty, instagram, whatsapp, tier, is_test")
        .eq("is_approved", true)
        .in("tier", ["premium", "ouro"])
        .order("name", { ascending: true });

      if (error) throw error;
      
      // Remove duplicates by name (keep first occurrence)
      const uniquePartners = data?.reduce((acc, partner) => {
        if (!acc.find(p => p.name === partner.name)) {
          acc.push(partner);
        }
        return acc;
      }, [] as typeof data) || [];
      
      // Sort by tier: premium first, then ouro
      return uniquePartners.sort((a, b) => {
        if (a.tier === "premium" && b.tier !== "premium") return -1;
        if (a.tier !== "premium" && b.tier === "premium") return 1;
        return 0;
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const PremiumPartnerSlots = () => {
  const { data: partners, isLoading } = useAllPremiumAndGoldPartners();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotation every 4 seconds
  useEffect(() => {
    if (!partners || partners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [partners]);

  // Reset index if partners change
  useEffect(() => {
    if (partners && currentIndex >= partners.length) {
      setCurrentIndex(0);
    }
  }, [partners, currentIndex]);

  const getPartnerLogo = (partner: { name?: string | null; logo_url?: string | null }) => {
    if (partner.logo_url) return partner.logo_url;
    if (partner.name === "NaturUai") return naturuaiLogo;
    return logoImage;
  };

  const handlePartnerClick = (partner: { 
    instagram?: string | null; 
    whatsapp?: string | null; 
    tier?: string | null; 
    is_test?: boolean | null;
    name?: string | null;
  }) => {
    if (partner.is_test) return;
    
    const isPremium = partner.tier === "premium";
    
    if (isPremium && partner.instagram) {
      // Premium: Open Instagram
      const handle = partner.instagram.replace(/^@/, "").trim();
      window.open(`https://instagram.com/${handle}`, "_blank");
    } else if (!isPremium && partner.whatsapp) {
      // Gold: Open WhatsApp with default message
      const phone = partner.whatsapp.replace(/\D/g, "");
      const message = encodeURIComponent(`Olá ${partner.name}! Encontrei seu contato no Meta Solidária.`);
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-purple-400" />
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h3 className="text-lg font-semibold text-primary-foreground">
            Parceiros Solidários
          </h3>
        </div>
        <div className="flex justify-center">
          <Skeleton className="w-[200px] h-[120px] rounded-xl bg-primary-foreground/20" />
        </div>
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  const currentPartner = partners[currentIndex];
  const isPremium = currentPartner?.tier === "premium";
  const hasClickAction = isPremium 
    ? !!currentPartner?.instagram && !currentPartner?.is_test
    : !!currentPartner?.whatsapp && !currentPartner?.is_test;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-purple-400" />
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h3 className="text-lg font-semibold text-primary-foreground">
          Parceiros Solidários
        </h3>
      </div>
      
      <TooltipProvider delayDuration={100}>
        {/* Current Partner Card */}
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                key={currentPartner.id}
                className={`relative rounded-xl p-5 bg-primary-foreground/15 min-w-[220px] max-w-[280px] animate-in fade-in duration-500 ${
                  hasClickAction ? "cursor-pointer hover:bg-primary-foreground/25" : ""
                } ${currentPartner.is_test ? "opacity-70" : ""} transition-colors`}
                onClick={() => handlePartnerClick(currentPartner)}
              >
                {/* Test Badge */}
                {currentPartner.is_test && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-500/80 text-white">
                    🧪 Teste
                  </span>
                )}
                
                <div className="flex flex-col items-center text-center gap-3">
                  {/* Avatar with tier-specific border */}
                  <Avatar className={`w-16 h-16 rounded-full border-2 ${
                    isPremium ? "border-purple-400/50" : "border-yellow-400/50"
                  } bg-white`}>
                    <AvatarImage 
                      src={getPartnerLogo(currentPartner)} 
                      alt={currentPartner.name || "Parceiro"} 
                      className="object-contain p-1"
                    />
                    <AvatarFallback className={`rounded-full font-semibold ${
                      isPremium ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {currentPartner.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Partner Name */}
                  <span className="text-sm font-semibold text-primary-foreground">
                    {currentPartner.name}
                  </span>
                  
                  {/* Specialty */}
                  {currentPartner.specialty && (
                    <span className="text-xs text-primary-foreground/70 -mt-2">
                      {currentPartner.specialty}
                    </span>
                  )}
                  
                  {/* Tier Badge */}
                  <Badge 
                    variant="outline"
                    className={isPremium 
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs" 
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs"
                    }
                  >
                    {isPremium ? (
                      <><Crown className="w-3 h-3 mr-1" /> Premium</>
                    ) : (
                      <><Star className="w-3 h-3 mr-1 fill-current" /> Ouro</>
                    )}
                  </Badge>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
              <p className="font-medium">{currentPartner.name}</p>
              {currentPartner.specialty && (
                <p className="text-xs text-primary-foreground/80">{currentPartner.specialty}</p>
              )}
              {currentPartner.is_test ? (
                <p className="text-xs text-primary-foreground/70 mt-1">Parceiro de demonstração</p>
              ) : isPremium && currentPartner.instagram ? (
                <p className="text-xs text-primary-foreground/70 mt-1">Clique para ver o Instagram</p>
              ) : !isPremium && currentPartner.whatsapp ? (
                <p className="text-xs text-primary-foreground/70 mt-1">Clique para abrir o WhatsApp</p>
              ) : null}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Position Indicators */}
        {partners.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {partners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ver parceiro ${idx + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex 
                    ? "bg-primary-foreground" 
                    : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                }`}
              />
            ))}
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};
