import { useState, Suspense, lazy } from "react";
import { ArrowDown, Heart, Users, Target, Gift, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useHeroStats } from "@/hooks/useHeroStats";


// Lazy load non-critical components to improve FCP
const HeroPremiumLogos = lazy(() => import("./HeroPremiumLogos").then(m => ({ default: m.HeroPremiumLogos })));
const HeroStats = lazy(() => import("./HeroStats").then(m => ({ default: m.HeroStats })));

// Lazy load modals - only needed on user interaction
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));
const CreateGroupModal = lazy(() => import("./CreateGroupModal").then(m => ({ default: m.CreateGroupModal })));

// Lightweight placeholder for lazy components
const LogoPlaceholder = () => (
  <div className="border-l border-primary-foreground/30 pl-3">
    <Skeleton style={{ width: 80, height: 80 }} className="rounded-lg bg-primary-foreground/20" />
  </div>
);

const StatsPlaceholder = () => (
  <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
    {[1, 2, 3].map(i => (
      <div key={i} className="text-center">
        <Skeleton className="h-8 w-20 mx-auto mb-1 bg-primary-foreground/20" />
        <Skeleton className="h-4 w-16 mx-auto bg-primary-foreground/20" />
      </div>
    ))}
  </div>
);

// Mini "Como Funciona" inline steps
const miniSteps = [
  { icon: Users, label: "Crie um grupo" },
  { icon: Target, label: "Defina metas" },
  { icon: Gift, label: "Doe para quem precisa" },
];

export const Hero = () => {
  const { user } = useAuth();
  const { data: heroStats } = useHeroStats();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const scrollToGroups = () => {
    document.getElementById("grupos")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateGroupClick = () => {
    if (user) {
      setCreateGroupOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const totalVolunteers = heroStats?.totalUsers || 0;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient only - no image for better performance */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary via-primary/95 to-primary/90" />

      {/* Content - Using CSS animations instead of framer-motion */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8 overflow-visible animate-scale-in">
            <Heart className="w-4 h-4 text-secondary" fill="currentColor" />
            <span className="text-primary-foreground text-base font-medium">
              Transforme suas metas em solidariedade
            </span>
            <Suspense fallback={<LogoPlaceholder />}>
              <HeroPremiumLogos />
            </Suspense>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
            Cada meta alcançada,{" "}
            <span className="text-secondary">uma doação</span>
          </h1>

          <p className="text-base md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Junte-se ou crie grupos comprometidos em transformar metas pessoais em
            ações solidárias. Doe alimentos, livros, roupas, mudas de árvore, cobertores e muito mais.
          </p>

          {/* Mini Como Funciona - 3 passos inline */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
            {miniSteps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-primary-foreground/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                  <step.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                  <span className="text-primary-foreground text-xs sm:text-sm font-medium whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
                {index < miniSteps.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-primary-foreground/40 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* CTAs reordenados - "Ver Grupos" primeiro no mobile */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Button size="xl" variant="hero" onClick={scrollToGroups}>
              <Heart className="w-5 h-5" />
              Participar Agora
            </Button>
            <Button size="xl" variant="hero-outline" onClick={handleCreateGroupClick}>
              <Users className="w-5 h-5" />
              Criar Grupo
            </Button>
          </div>

          {/* Micro prova social */}
          {totalVolunteers > 0 && (
            <p className="text-primary-foreground/60 text-xs sm:text-sm mb-8 animate-fade-in">
              Junte-se a <span className="text-secondary font-semibold">{totalVolunteers.toLocaleString('pt-BR')}+</span> voluntários que já participam
            </p>
          )}

          {/* Stats Counters - Lazy loaded */}
          <Suspense fallback={<StatsPlaceholder />}>
            <HeroStats />
          </Suspense>
        </div>

        {/* Scroll Indicator - CSS animation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="animate-bounce">
            <ArrowDown className="w-6 h-6 text-primary-foreground/50" />
          </div>
        </div>
      </div>

      {/* Modals - Lazy loaded */}
      <Suspense fallback={null}>
        <AuthModal
          open={authModalOpen}
          onOpenChange={open => {
            setAuthModalOpen(open);
            // Se fechou o modal de auth e agora está logado, abrir criação de grupo
            if (!open && user) {
              setCreateGroupOpen(true);
            }
          }}
        />
      </Suspense>
      <Suspense fallback={null}>
        <CreateGroupModal
          open={createGroupOpen}
          onOpenChange={setCreateGroupOpen}
          onRequireAuth={() => {
            setCreateGroupOpen(false);
            setAuthModalOpen(true);
          }}
        />
      </Suspense>
    </section>
  );
};
