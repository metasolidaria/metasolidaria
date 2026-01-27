import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ImpactCounter } from "@/components/ImpactCounter";
import { GroupsSection } from "@/components/GroupsSection";
import { EntitiesSection } from "@/components/EntitiesSection";
import { PartnersSection } from "@/components/PartnersSection";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { useInviteLink } from "@/hooks/useInviteLink";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { needsAuth, isAccepting } = useInviteLink();

  // Open auth modal if user needs to login to accept invite
  useEffect(() => {
    if (needsAuth) {
      setIsAuthModalOpen(true);
    }
  }, [needsAuth]);

  const handleRequireAuth = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      {isAccepting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-foreground font-medium">Entrando no grupo...</p>
          </div>
        </div>
      )}
      <main>
        <Hero />
        <div id="como-funciona">
          <HowItWorks />
        </div>
        <div id="impacto">
          <ImpactCounter />
        </div>
        <GroupsSection onRequireAuth={handleRequireAuth} />
        <div id="entidades">
          <EntitiesSection onRequireAuth={handleRequireAuth} />
        </div>
        <PartnersSection />
      </main>
      <Footer />
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
};

export default Index;
