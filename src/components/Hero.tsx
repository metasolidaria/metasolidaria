import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Heart, Users, UserCheck, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import heroImage from "@/assets/hero-donation.jpg";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { useHeroStats } from "@/hooks/useHeroStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";
// Animated counter component - only animates once when value first becomes available
const AnimatedCounter = ({
  value,
  duration = 2000
}: {
  value: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    // Skip animation if already animated or no value
    if (hasAnimated || value === 0) {
      setCount(value);
      return;
    }

    // Start animation
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        setHasAnimated(true);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [value, duration, hasAnimated]);
  return <span>{count.toLocaleString('pt-BR')}</span>;
};

// Hook to fetch premium partners for Hero
const usePremiumPartnersHero = () => {
  return useQuery({
    queryKey: ["premiumPartnersHero"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("partners_public").select("id, name, logo_url, specialty, whatsapp").eq("is_approved", true).eq("tier", "premium").order("name", {
        ascending: true
      });
      if (error) throw error;

      // Remove duplicates by name
      const uniquePartners = data?.reduce((acc, partner) => {
        if (!acc.find(p => p.name === partner.name)) {
          acc.push(partner);
        }
        return acc;
      }, [] as typeof data) || [];
      return uniquePartners;
    },
    staleTime: 5 * 60 * 1000
  });
};

// Mini carousel component for Hero
const HeroPremiumLogos = () => {
  const {
    data: premiumPartners,
    isLoading
  } = usePremiumPartnersHero();
  const autoplayPlugin = useMemo(() => Autoplay({
    delay: 2500,
    stopOnInteraction: false,
    stopOnMouseEnter: true
  }), []);

  // Show skeleton while loading
  if (isLoading) {
    return <div className="border-l border-primary-foreground/30 pl-3">
        <Skeleton className="w-12 h-12 rounded-lg bg-primary-foreground/20" />
      </div>;
  }

  // Hide if no partners
  if (!premiumPartners || premiumPartners.length === 0) {
    return null;
  }
  const getPartnerLogo = (partner: {
    name?: string | null;
    logo_url?: string | null;
  }) => {
    if (partner.logo_url) return partner.logo_url;
    if (partner.name === "NaturUai") return naturuaiLogo;
    return logoImage;
  };
  const handleWhatsAppClick = (partner: {
    name: string;
    whatsapp?: string | null;
  }) => {
    if (!partner.whatsapp) return;
    const cleanNumber = partner.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá ${partner.name}! Encontrei seu contato no Meta Solidária.`);
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, "_blank");
  };
  return <div className="border-l border-primary-foreground/30 pl-3">
      <TooltipProvider delayDuration={100}>
          <Carousel opts={{
        align: "center",
        loop: true
      }} plugins={[autoplayPlugin]} className="w-[90px]">
          <CarouselContent className="-ml-1">
            {premiumPartners.map(partner => <CarouselItem key={partner.id} className="pl-1 basis-full flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="w-14 h-14 rounded-lg border-2 border-primary-foreground/30 bg-white/90 cursor-pointer hover:border-primary-foreground/60 transition-all shadow-md hover:shadow-lg hover:scale-105" onClick={() => handleWhatsAppClick(partner)}>
                      <AvatarImage src={getPartnerLogo(partner)} alt={partner.name || "Parceiro Premium"} className="object-contain p-1" />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {partner.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
                    <p className="font-medium text-xs">{partner.name}</p>
                    {partner.specialty && <p className="text-[10px] text-primary-foreground/80">{partner.specialty}</p>}
                  </TooltipContent>
                </Tooltip>
              </CarouselItem>)}
          </CarouselContent>
        </Carousel>
      </TooltipProvider>
    </div>;
};
export const Hero = () => {
  const {
    user
  } = useAuth();
  const {
    data: heroStats,
    isLoading: isLoadingStats
  } = useHeroStats();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const scrollToGroups = () => {
    document.getElementById("grupos")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  const handleCreateGroupClick = () => {
    if (user) {
      setCreateGroupOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay - using fetchpriority for LCP optimization */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Comunidade unida" 
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        ease: "easeOut"
      }} className="max-w-4xl mx-auto">
          <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2,
          type: "spring",
          stiffness: 200
        }} className="inline-flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8 overflow-visible">
            <Heart className="w-4 h-4 text-secondary" fill="currentColor" />
            <span className="text-primary-foreground text-base font-medium">
              Transforme suas metas em solidariedade
            </span>
            <HeroPremiumLogos />
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
            Cada meta alcançada,{" "}
            <span className="text-secondary">
uma doação</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            Junte-se a grupos comprometidos em transformar metas pessoais em
            ações solidárias. Doe alimentos, livros, roupas, cobertores e muito mais. 
            Sua atitude, mudará vidas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="xl" variant="hero" onClick={handleCreateGroupClick}>
              <Users className="w-5 h-5" />
              Criar Grupo
            </Button>
            <Button size="xl" variant="hero-outline" onClick={scrollToGroups}>
              Ver Grupos Ativos
            </Button>
          </div>

          {/* Stats Counters */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6,
          duration: 0.5
        }} className="flex flex-wrap justify-center gap-6 sm:gap-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-secondary" />
                {isLoadingStats ? <Skeleton className="h-8 w-16 bg-primary-foreground/20" /> : <span className="text-2xl sm:text-3xl font-bold text-secondary">
                    +<AnimatedCounter value={heroStats?.totalGroups || 0} />
                  </span>}
              </div>
              <p className="text-primary-foreground/70 text-xs sm:text-sm">Grupos Ativos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <UserCheck className="w-5 h-5 text-secondary" />
                {isLoadingStats ? <Skeleton className="h-8 w-20 bg-primary-foreground/20" /> : <span className="text-2xl sm:text-3xl font-bold text-secondary">
                    +<AnimatedCounter value={heroStats?.totalUsers || 0} />
                  </span>}
              </div>
              <p className="text-primary-foreground/70 text-xs sm:text-sm">Voluntários</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="w-5 h-5 text-secondary" />
                {isLoadingStats ? <Skeleton className="h-8 w-24 bg-primary-foreground/20" /> : <span className="text-2xl sm:text-3xl font-bold text-secondary">
                    +<AnimatedCounter value={heroStats?.totalGoals || 0} />
                  </span>}
              </div>
              <p className="text-primary-foreground/70 text-xs sm:text-sm">Metas Definidas</p>
            </div>
          </motion.div>

        </motion.div>

        {/* Scroll Indicator */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 1,
        duration: 0.5
      }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{
          y: [0, 10, 0]
        }} transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }}>
            <ArrowDown className="w-6 h-6 text-primary-foreground/50" />
          </motion.div>
        </motion.div>
      </div>

      {/* Modals */}
      <AuthModal open={authModalOpen} onOpenChange={open => {
      setAuthModalOpen(open);
      // Se fechou o modal de auth e agora está logado, abrir criação de grupo
      if (!open && user) {
        setCreateGroupOpen(true);
      }
    }} />
      <CreateGroupModal open={createGroupOpen} onOpenChange={setCreateGroupOpen} onRequireAuth={() => {
      setCreateGroupOpen(false);
      setAuthModalOpen(true);
    }} />
    </section>;
};