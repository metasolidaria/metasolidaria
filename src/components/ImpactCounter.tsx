import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Scale, Users, Heart, TrendingUp } from "lucide-react";
import { useImpactStats } from "@/hooks/useImpactStats";

const AnimatedNumber = ({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
};

export const ImpactCounter = () => {
  const [isInView, setIsInView] = useState(false);
  const { data: impactData } = useImpactStats();

  const stats = [
    {
      icon: Users,
      value: impactData?.participants || 0,
      suffix: "",
      label: "Participantes Ativos",
    },
    {
      icon: Scale,
      value: impactData?.goalsReached || 0,
      suffix: "",
      label: "Metas Alcançadas",
    },
    {
      icon: Heart,
      value: impactData?.donations || 0,
      suffix: "",
      label: "Doações Realizadas",
    },
    {
      icon: TrendingUp,
      value: impactData?.groups || 0,
      suffix: "",
      label: "Grupos Ativos",
    },
  ];

  return (
    <section className="py-20 bg-gradient-stats relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onViewportEnter={() => setIsInView(true)}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Nosso Impacto Coletivo
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Juntos, estamos transformando vidas através de metas saudáveis
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-primary-foreground/20"
            >
              <stat.icon className="w-8 h-8 text-primary-foreground mx-auto mb-4" />
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {isInView && (
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-sm text-primary-foreground/70">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
