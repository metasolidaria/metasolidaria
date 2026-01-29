import { useState, Suspense, lazy } from "react";
import { ArrowDown, Heart, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

// Direct path to public folder - enables preload in index.html
const heroImage = "/hero-donation.webp";

// Lazy load non-critical components to improve FCP
const HeroPremiumLogos = lazy(() => import("./HeroPremiumLogos").then(m => ({ default: m.HeroPremiumLogos })));
const HeroStats = lazy(() => import("./HeroStats").then(m => ({ default: m.HeroStats })));

// Lazy load modals - only needed on user interaction
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));
const CreateGroupModal = lazy(() => import("./CreateGroupModal").then(m => ({ default: m.CreateGroupModal })));

// Lightweight placeholder for lazy components
const LogoPlaceholder = () => (
  <div className="border-l border-primary-foreground/30 pl-3">
    <Skeleton className="w-12 h-12 rounded-lg bg-primary-foreground/20" />
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

export const Hero = () => {
  const { user } = useAuth();
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with responsive srcSet */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          srcSet="/hero-donation-mobile.webp 640w, /hero-donation-tablet.webp 1024w, /hero-donation.webp 1920w"
          sizes="100vw"
          alt="Comunidade unida fazendo doações"
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/60" />
      </div>

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

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
            Cada meta alcançada,{" "}
            <span className="text-secondary">uma doação</span>
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
