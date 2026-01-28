import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { ImpactCounter } from "@/components/ImpactCounter";
import { GroupsSection } from "@/components/GroupsSection";
import { EntitiesSection } from "@/components/EntitiesSection";
import { PartnersSection } from "@/components/PartnersSection";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { useInviteLink } from "@/hooks/useInviteLink";
import { InstallPWAPrompt } from "@/components/InstallPWAPrompt";

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
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const partnersSection = document.getElementById("parceiros");
        if (partnersSection) {
          partnersSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
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
      <HowItWorksModal />
      <main>
        <Hero />
        <div id="impacto">
          <ImpactCounter />
        </div>
        <GroupsSection onRequireAuth={handleRequireAuth} />
        <div id="entidades">
          <EntitiesSection onRequireAuth={handleRequireAuth} />
        </div>
        <div id="parceiros">
          <PartnersSection />
        </div>
      </main>
      <Footer />
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      <InstallPWAPrompt />
    </div>
  );
};

export default Index;
