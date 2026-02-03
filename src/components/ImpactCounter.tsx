import { useEffect, useState, useRef } from "react";
import { Heart, Apple, BookOpen, Shirt, BedDouble, Soup, Gift, Package, TreeDeciduous } from "lucide-react";
import { useImpactStats, DonationsByType } from "@/hooks/useImpactStats";
import { PremiumPartnerSlots } from "./PremiumPartnerSlots";
import { Skeleton } from "./ui/skeleton";

// Animated counter - only animates once when value first becomes available
const AnimatedNumber = ({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Skip animation if already animated or no value
    if (hasAnimated || value === 0) {
      setDisplayValue(value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        setHasAnimated(true);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, hasAnimated]);

  return (
    <span>
      {displayValue.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
};

const donationTypeConfig = [
  { key: "alimentos" as keyof DonationsByType, label: "Kg de Alimento", icon: Apple, unit: "kg" },
  { key: "livros" as keyof DonationsByType, label: "Livros", icon: BookOpen, unit: "un" },
  { key: "roupas" as keyof DonationsByType, label: "Roupas", icon: Shirt, unit: "peças" },
  { key: "cobertores" as keyof DonationsByType, label: "Cobertores", icon: BedDouble, unit: "un" },
  { key: "sopas" as keyof DonationsByType, label: "Sopas", icon: Soup, unit: "porções" },
  { key: "higiene" as keyof DonationsByType, label: "Kits de Higiene", icon: Package, unit: "kits" },
  { key: "brinquedos" as keyof DonationsByType, label: "Brinquedos", icon: Gift, unit: "un" },
  { key: "mudas" as keyof DonationsByType, label: "Mudas de Árvore", icon: TreeDeciduous, unit: "un" },
];

// Hook for intersection observer
const useInView = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
};

export const ImpactCounter = () => {
  const { ref, isInView } = useInView();
  const { data: impactData, isLoading } = useImpactStats();

  return (
    <section className="py-20 bg-gradient-stats relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Layout: Grid for Desktop, Stack for Mobile */}
        <div className="flex flex-col items-center">
        <div className="w-full max-w-5xl">
            {/* Doadômetro Section */}
            <div className="w-full" ref={ref}>
              {/* Header */}
              <div
                className={`text-center mb-8 ${isInView ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : 'opacity-0'}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/20 mb-4">
                  <Heart className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  Doadômetro
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                  Impacto social gerado até o momento
                </p>
              </div>

              {/* Central Counter with Mascot */}
              <div
                className={`flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 mb-6 ${isInView ? 'animate-in fade-in zoom-in-95 duration-500' : 'opacity-0'}`}
                style={{ animationDelay: '200ms' }}
              >
                {/* Counter */}
                <div className="text-center">
                  <div className="text-6xl md:text-8xl font-bold text-primary-foreground mb-2">
                    {isLoading ? (
                      <Skeleton className="h-20 md:h-24 w-48 md:w-64 mx-auto bg-primary-foreground/20" />
                    ) : isInView ? (
                      <AnimatedNumber value={impactData?.totalDonations || 0} suffix="" />
                    ) : null}
                  </div>
                  <p className="text-primary-foreground/70 text-xl">
                    doações realizadas
                  </p>
                </div>
                
                {/* Mascot with floating animation */}
                <img 
                  src="/mascote-meta-solidaria.png" 
                  alt="Mascote Meta Solidária" 
                  className="w-28 lg:w-40 xl:w-48 h-auto drop-shadow-lg animate-float"
                />
              </div>

            {/* Breakdown by Type - Only show types with values */}
            {(() => {
              const typesWithValues = donationTypeConfig.filter(
                (type) => (impactData?.donationsByType?.[type.key] || 0) > 0
              );
              
              if (isLoading || typesWithValues.length === 0) return null;
              
              return (
                <div className={`grid gap-4 ${
                  typesWithValues.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
                  typesWithValues.length === 2 ? 'grid-cols-2 max-w-md mx-auto' :
                  typesWithValues.length === 3 ? 'grid-cols-3 max-w-lg mx-auto' :
                  typesWithValues.length === 4 ? 'grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto' :
                  typesWithValues.length === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-3xl mx-auto' :
                  typesWithValues.length === 6 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6 max-w-4xl mx-auto' :
                  'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
                }`}>
                  {typesWithValues.map((type, index) => (
                    <div
                      key={type.key}
                      className={`bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 text-center border border-primary-foreground/20 ${isInView ? 'animate-in fade-in slide-in-from-bottom-4 duration-400' : 'opacity-0'}`}
                      style={{ animationDelay: `${300 + index * 50}ms` }}
                    >
                      <type.icon className="w-6 h-6 text-primary-foreground mx-auto mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                        {isInView ? (
                          <AnimatedNumber 
                            value={impactData?.donationsByType?.[type.key] || 0} 
                            suffix="" 
                          />
                        ) : null}
                      </div>
                      <div className="text-xs text-primary-foreground/60">
                        {type.label}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            </div>
          </div>

          {/* Premium Partners Section - Centered below */}
          <div
            className={`mt-12 ${isInView ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : 'opacity-0'}`}
            style={{ animationDelay: '500ms' }}
          >
            <PremiumPartnerSlots />
          </div>
        </div>
      </div>
    </section>
  );
};
