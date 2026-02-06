import { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { useInviteLink } from "@/hooks/useInviteLink";

// Lazy load AuthModal to reduce initial bundle size
const AuthModal = lazy(() => import("@/components/AuthModal").then(m => ({ default: m.AuthModal })));

// Lazy load below-the-fold sections to improve FCP and LCP
const HowItWorksModal = lazy(() => import("@/components/HowItWorksModal").then(m => ({ default: m.HowItWorksModal })));
const ImpactCounter = lazy(() => import("@/components/ImpactCounter").then(m => ({ default: m.ImpactCounter })));
const GroupsSection = lazy(() => import("@/components/GroupsSection").then(m => ({ default: m.GroupsSection })));
const EntitiesSection = lazy(() => import("@/components/EntitiesSection").then(m => ({ default: m.EntitiesSection })));
const PartnersSection = lazy(() => import("@/components/PartnersSection").then(m => ({ default: m.PartnersSection })));


// Minimal loading placeholder for sections
const SectionPlaceholder = () => (
  <div className="py-16 flex justify-center">
    <div className="animate-pulse bg-muted h-32 w-full max-w-4xl rounded-lg" />
  </div>
);

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { needsAuth, isAccepting, inviteInfo, isLoading: inviteLoading } = useInviteLink();
  const [searchParams] = useSearchParams();

  // Open auth modal if user needs to login to accept invite
  useEffect(() => {
    if (needsAuth) {
      setIsAuthModalOpen(true);
    }
  }, [needsAuth]);

  // Scroll to partners section if parceiros param is present
  useEffect(() => {
    if (searchParams.get("parceiros") === "true") {
      // Retry scroll until element is found (lazy loaded components)
      const attemptScroll = (attempts = 0) => {
        const partnersSection = document.getElementById("parceiros");
        if (partnersSection) {
          partnersSection.scrollIntoView({ behavior: "smooth" });
        } else if (attempts < 10) {
          // Retry up to 10 times with increasing delay
          setTimeout(() => attemptScroll(attempts + 1), 150);
        }
      };
      // Start after initial render
      setTimeout(() => attemptScroll(), 300);
    }
  }, [searchParams]);

  const handleRequireAuth = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      {/* Loading invite info */}
      {inviteLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-foreground font-medium">Carregando convite...</p>
          </div>
        </div>
      )}

      {/* Invite welcome message */}
      {inviteInfo && !isAccepting && needsAuth && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-card p-8 rounded-2xl shadow-xl text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Você foi convidado!
            </h2>
            <p className="text-muted-foreground mb-4">
              Você foi convidado para participar do grupo{" "}
              <span className="font-semibold text-primary">{inviteInfo.groupName}</span>{" "}
              do META SOLIDÁRIA.
            </p>
            <p className="text-sm text-muted-foreground">
              Faça login ou crie uma conta para entrar no grupo.
            </p>
          </div>
        </div>
      )}

      {/* Accepting invite */}
      {isAccepting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-foreground font-medium">
              Entrando no grupo {inviteInfo?.groupName || ""}...
            </p>
          </div>
        </div>
      )}
      
      <Suspense fallback={null}>
        <HowItWorksModal />
      </Suspense>
      
      <main>
        <Hero />
        <Suspense fallback={<SectionPlaceholder />}>
          <div id="impacto">
            <ImpactCounter />
          </div>
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <GroupsSection onRequireAuth={handleRequireAuth} />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <div id="entidades">
            <EntitiesSection onRequireAuth={handleRequireAuth} />
          </div>
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <div id="parceiros">
            <PartnersSection />
          </div>
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      </Suspense>
    </div>
  );
};

export default Index;
