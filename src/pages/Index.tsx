import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ImpactCounter } from "@/components/ImpactCounter";
import { GroupsSection } from "@/components/GroupsSection";
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
      </main>
      <Footer />
    </div>
  );
};

export default Index;
