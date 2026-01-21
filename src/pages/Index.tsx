import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ImpactCounter } from "@/components/ImpactCounter";
import { GroupsSection } from "@/components/GroupsSection";
import { EntitiesSection } from "@/components/EntitiesSection";
import { PartnersSection } from "@/components/PartnersSection";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleRequireAuth = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
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
