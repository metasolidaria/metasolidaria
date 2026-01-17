import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ImpactCounter } from "@/components/ImpactCounter";
import { GroupsSection } from "@/components/GroupsSection";
import { PartnersSection } from "@/components/PartnersSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <div id="como-funciona">
          <HowItWorks />
        </div>
        <div id="impacto">
          <ImpactCounter />
        </div>
        <GroupsSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
