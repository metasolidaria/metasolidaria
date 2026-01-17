import { motion } from "framer-motion";
import { ArrowDown, Heart, Scale, Users } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-community.jpg";

export const Hero = () => {
  const scrollToGroups = () => {
    document.getElementById("grupos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Comunidade unida"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8"
          >
            <Heart className="w-4 h-4 text-secondary" fill="currentColor" />
            <span className="text-primary-foreground text-sm font-medium">
              Transforme sua saúde em solidariedade
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
            Cada kg perdido,{" "}
            <span className="text-secondary">1kg doado</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a grupos comprometidos em transformar metas de saúde em
            ações que alimentam famílias. Em 2026, sua jornada pode mudar vidas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="xl" variant="hero" onClick={scrollToGroups}>
              <Users className="w-5 h-5" />
              Criar Grupo
            </Button>
            <Button size="xl" variant="hero-outline" onClick={scrollToGroups}>
              Ver Grupos Ativos
            </Button>
          </div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto"
          >
            {[
              { icon: Users, label: "Grupos", value: "24" },
              { icon: Scale, label: "kg Perdidos", value: "1.2K" },
              { icon: Heart, label: "kg Doados", value: "1.2K" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10"
              >
                <stat.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-primary-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown className="w-6 h-6 text-primary-foreground/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
