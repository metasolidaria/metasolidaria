import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, Apple, BookOpen, Shirt, BedDouble, Soup, Gift, Package } from "lucide-react";
import { useImpactStats, DonationsByType } from "@/hooks/useImpactStats";
import { PremiumPartnerSlots } from "./PremiumPartnerSlots";

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
];

export const ImpactCounter = () => {
  const [isInView, setIsInView] = useState(false);
  const { data: impactData } = useImpactStats();

  return (
    <section className="py-20 bg-gradient-stats relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Layout: Vertical Stack */}
        <div className="flex flex-col items-center">
          {/* Doadômetro Section */}
          <div className="w-full max-w-5xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onViewportEnter={() => setIsInView(true)}
              className="text-center mb-8"
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
            </motion.div>

            {/* Central Counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-12"
            >
              <div className="text-6xl md:text-8xl font-bold text-primary-foreground mb-2">
                {isInView && (
                  <AnimatedNumber value={impactData?.totalDonations || 0} suffix="" />
                )}
              </div>
              <p className="text-primary-foreground/70 text-xl">
                doações realizadas
              </p>
            </motion.div>

            {/* Breakdown by Type */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {donationTypeConfig.map((type, index) => (
                <motion.div
                  key={type.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 text-center border border-primary-foreground/20"
                >
                  <type.icon className="w-6 h-6 text-primary-foreground mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                    {isInView && (
                      <AnimatedNumber 
                        value={impactData?.donationsByType?.[type.key] || 0} 
                        suffix="" 
                      />
                    )}
                  </div>
                  <div className="text-xs text-primary-foreground/60">
                    {type.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Premium Partners Section - Centered below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <PremiumPartnerSlots />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
