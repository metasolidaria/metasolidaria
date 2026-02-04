import { useState, useEffect } from "react";
import { Crown, Star, Phone, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const naturuaiLogo = "/naturuai-logo.jpg";
const logoImage = "/logo.jpg";

// Hook to fetch Premium and Gold partners for spotlight
const useFeaturedPartners = () => {
  return useQuery({
    queryKey: ["featuredPartnersSpotlight"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_public")
        .select("id, name, logo_url, specialty, instagram, whatsapp, tier, city, description, is_test")
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

export const FeaturedPartnerSpotlight = () => {
  const { data: partners, isLoading } = useFeaturedPartners();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    if (!partners || partners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 5000);
    
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

  const handleWhatsAppClick = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${name}! Encontrei seu contato no Meta Solidária.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
  };

  const handleInstagramClick = (instagram: string) => {
    const handle = instagram.replace(/^@/, "").trim();
    window.open(`https://instagram.com/${handle}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-purple-500" />
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h3 className="text-lg font-semibold text-foreground">
            Parceiro em Destaque
          </h3>
        </div>
        <Skeleton className="h-32 w-full max-w-md mx-auto rounded-2xl" />
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  const currentPartner = partners[currentIndex];
  const isPremium = currentPartner?.tier === "premium";

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-purple-500" />
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h3 className="text-lg font-semibold text-foreground">
          Parceiro em Destaque
        </h3>
      </div>

      {/* Featured Partner Card */}
      <div className="flex justify-center">
        <div
          key={currentPartner.id}
          className={`relative bg-card rounded-2xl overflow-hidden shadow-lg max-w-md w-full animate-in fade-in duration-500 ${
            currentPartner.is_test ? "opacity-75" : ""
          } ${
            isPremium 
              ? "ring-2 ring-purple-500/50" 
              : "ring-2 ring-yellow-500/50"
          }`}
        >
          {/* Tier Badge */}
          <div className="absolute top-3 right-3 z-10">
            {currentPartner.is_test && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-500/80 text-white mr-2">
                🧪 Teste
              </span>
            )}
            <Badge 
              className={isPremium 
                ? "bg-purple-700 text-white border-purple-700" 
                : "bg-yellow-600 text-white border-yellow-600"
              }
            >
              {isPremium ? (
                <><Crown className="w-3 h-3 mr-1" /> Premium</>
              ) : (
                <><Crown className="w-3 h-3 mr-1" /> Ouro</>
              )}
            </Badge>
          </div>

          <div className="flex gap-4 p-5">
            {/* Avatar */}
            <Avatar className={`w-20 h-20 rounded-xl border-2 ${
              isPremium ? "border-purple-400/50" : "border-yellow-400/50"
            } bg-white`}>
              <AvatarImage 
                src={getPartnerLogo(currentPartner)} 
                alt={currentPartner.name || "Parceiro"} 
                className="object-contain p-1"
              />
              <AvatarFallback className={`rounded-xl font-semibold ${
                isPremium ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {currentPartner.name?.charAt(0) || "P"}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground truncate text-lg">
                {currentPartner.name}
              </h4>
              <p className="text-sm text-primary font-medium">
                {currentPartner.specialty}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentPartner.city}
              </p>
              {currentPartner.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {currentPartner.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex gap-2">
            {currentPartner.whatsapp && !currentPartner.is_test && (
              <Button
                className="flex-1 gap-2"
                variant="hero"
                onClick={() => handleWhatsAppClick(currentPartner.whatsapp!, currentPartner.name!)}
              >
                <Phone className="w-4 h-4" />
                Entrar em Contato
              </Button>
            )}
            {currentPartner.instagram && !currentPartner.is_test && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleInstagramClick(currentPartner.instagram!)}
                title="Ver Instagram"
              >
                <Instagram className="w-4 h-4" />
              </Button>
            )}
            {currentPartner.is_test && (
              <Button
                className="flex-1"
                variant="secondary"
                disabled
              >
                Parceiro de Demonstração
              </Button>
            )}
          </div>
        </div>
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
                  ? "bg-primary" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
