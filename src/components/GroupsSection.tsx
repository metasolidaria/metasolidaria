import { motion } from "framer-motion";
import { useState } from "react";
import { Users, Scale, MapPin, Plus, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { CreateGroupModal } from "./CreateGroupModal";

const mockGroups = [
  {
    id: 1,
    name: "Equipe Saúde Total",
    members: 12,
    totalLost: 45,
    totalDonated: 45,
    city: "São Paulo, SP",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
  },
  {
    id: 2,
    name: "Vida Leve 2026",
    members: 8,
    totalLost: 32,
    totalDonated: 32,
    city: "Rio de Janeiro, RJ",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
  },
  {
    id: 3,
    name: "Unidos pela Mudança",
    members: 15,
    totalLost: 67,
    totalDonated: 67,
    city: "Curitiba, PR",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400",
  },
  {
    id: 4,
    name: "Corpo e Alma",
    members: 6,
    totalLost: 23,
    totalDonated: 23,
    city: "Belo Horizonte, MG",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400",
  },
  {
    id: 5,
    name: "Novos Horizontes",
    members: 10,
    totalLost: 41,
    totalDonated: 41,
    city: "Brasília, DF",
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400",
  },
  {
    id: 6,
    name: "Família Saudável",
    members: 5,
    totalLost: 18,
    totalDonated: 18,
    city: "Salvador, BA",
    image: "https://images.unsplash.com/photo-1523464862212-d6631d073194?w=400",
  },
];

export const GroupsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="grupos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Grupos Ativos
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Encontre um grupo perto de você ou crie o seu próprio
            </p>
          </div>
          <Button
            size="lg"
            variant="hero"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Criar Novo Grupo
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-primary-foreground">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-1 text-primary-foreground/80 text-sm">
                    <MapPin className="w-3 h-3" />
                    {group.city}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {group.members}
                    </div>
                    <div className="text-xs text-muted-foreground">Membros</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {group.totalLost}kg
                    </div>
                    <div className="text-xs text-muted-foreground">Perdidos</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-secondary">
                      {group.totalDonated}kg
                    </div>
                    <div className="text-xs text-muted-foreground">Doados</div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Participar do Grupo
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <CreateGroupModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
};
