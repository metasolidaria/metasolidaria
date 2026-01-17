import { motion } from "framer-motion";
import { Users, Scale, Apple, Heart } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Crie ou Entre em um Grupo",
    description:
      "Forme uma equipe com amigos, família ou colegas de trabalho comprometidos com a mudança.",
  },
  {
    icon: Scale,
    title: "Defina sua Meta",
    description:
      "Cada participante estabelece sua meta de peso para 2026 e se compromete com a doação.",
  },
  {
    icon: Apple,
    title: "Registre seu Progresso",
    description:
      "A cada kg perdido, registre no app. O sistema calcula automaticamente sua contribuição.",
  },
  {
    icon: Heart,
    title: "Faça a Diferença",
    description:
      "Sua meta de saúde se transforma em alimentos para quem precisa. Todos ganham!",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Funciona
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Um processo simples para transformar suas metas pessoais em impacto
            coletivo
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-glow transition-shadow duration-300 relative z-10">
                <div className="bg-gradient-stats w-14 h-14 rounded-xl flex items-center justify-center mb-5">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
