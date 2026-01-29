import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Target } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useHeroStats } from "@/hooks/useHeroStats";

// Animated counter component - only animates once when value first becomes available
const AnimatedCounter = ({
  value,
  duration = 2000
}: {
  value: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    // Skip animation if already animated or no value
    if (hasAnimated || value === 0) {
      setCount(value);
      return;
    }

    // Start animation
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        setHasAnimated(true);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [value, duration, hasAnimated]);
  
  return <span>{count.toLocaleString('pt-BR')}</span>;
};

export const HeroStats = () => {
  const { data: heroStats, isLoading: isLoadingStats } = useHeroStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="flex flex-wrap justify-center gap-6 sm:gap-12"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Users className="w-5 h-5 text-secondary" />
          {isLoadingStats ? (
            <Skeleton className="h-8 w-16 bg-primary-foreground/20" />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold text-secondary">
              +<AnimatedCounter value={heroStats?.totalGroups || 0} />
            </span>
          )}
        </div>
        <p className="text-primary-foreground/70 text-xs sm:text-sm">Grupos Ativos</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <UserCheck className="w-5 h-5 text-secondary" />
          {isLoadingStats ? (
            <Skeleton className="h-8 w-20 bg-primary-foreground/20" />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold text-secondary">
              +<AnimatedCounter value={heroStats?.totalUsers || 0} />
            </span>
          )}
        </div>
        <p className="text-primary-foreground/70 text-xs sm:text-sm">Voluntários</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Target className="w-5 h-5 text-secondary" />
          {isLoadingStats ? (
            <Skeleton className="h-8 w-24 bg-primary-foreground/20" />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold text-secondary">
              +<AnimatedCounter value={heroStats?.totalGoals || 0} />
            </span>
          )}
        </div>
        <p className="text-primary-foreground/70 text-xs sm:text-sm">Metas Definidas</p>
      </div>
    </motion.div>
  );
};
