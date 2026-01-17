import { motion } from "framer-motion";
import { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Star, 
  Search,
  Stethoscope,
  Apple,
  Brain,
  Dumbbell,
  HeartPulse,
  Baby
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const categories = [
  { id: "all", label: "Todos", icon: Star },
  { id: "nutricionista", label: "Nutricionista", icon: Apple },
  { id: "medico", label: "Médico", icon: Stethoscope },
  { id: "psicologo", label: "Psicólogo", icon: Brain },
  { id: "personal", label: "Personal Trainer", icon: Dumbbell },
  { id: "fisioterapeuta", label: "Fisioterapeuta", icon: HeartPulse },
  { id: "pediatra", label: "Pediatra", icon: Baby },
];

const mockPartners = [
  {
    id: 1,
    name: "Dra. Mariana Silva",
    specialty: "Nutricionista",
    category: "nutricionista",
    city: "São Paulo, SP",
    rating: 4.9,
    reviews: 127,
    phone: "(11) 99999-1234",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
  },
  {
    id: 2,
    name: "Dr. Carlos Mendes",
    specialty: "Médico Endocrinologista",
    category: "medico",
    city: "São Paulo, SP",
    rating: 4.8,
    reviews: 89,
    phone: "(11) 99999-5678",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
  },
  {
    id: 3,
    name: "Ana Paula Costa",
    specialty: "Personal Trainer",
    category: "personal",
    city: "Rio de Janeiro, RJ",
    rating: 5.0,
    reviews: 156,
    phone: "(21) 99999-9876",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
  },
  {
    id: 4,
    name: "Dra. Fernanda Lima",
    specialty: "Psicóloga",
    category: "psicologo",
    city: "Curitiba, PR",
    rating: 4.9,
    reviews: 203,
    phone: "(41) 99999-4321",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
  },
  {
    id: 5,
    name: "Dr. Roberto Alves",
    specialty: "Fisioterapeuta",
    category: "fisioterapeuta",
    city: "Belo Horizonte, MG",
    rating: 4.7,
    reviews: 78,
    phone: "(31) 99999-8765",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
  },
  {
    id: 6,
    name: "Dra. Juliana Santos",
    specialty: "Pediatra",
    category: "pediatra",
    city: "Brasília, DF",
    rating: 4.9,
    reviews: 145,
    phone: "(61) 99999-2468",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
  },
];

export const PartnersSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchCity, setSearchCity] = useState("");

  const filteredPartners = mockPartners.filter((partner) => {
    const matchesCategory =
      selectedCategory === "all" || partner.category === selectedCategory;
    const matchesCity =
      !searchCity ||
      partner.city.toLowerCase().includes(searchCity.toLowerCase());
    return matchesCategory && matchesCity;
  });

  const handleWhatsAppClick = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${name}! Encontrei seu contato através do Meta Solidária e gostaria de agendar uma consulta.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <section id="parceiros" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Guia de Parceiros
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre profissionais de saúde próximos de você para ajudar na sua
            jornada de transformação
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por cidade..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="pl-11"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex gap-4 p-5">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">
                    {partner.name}
                  </h3>
                  <p className="text-sm text-primary font-medium">
                    {partner.specialty}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {partner.city}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-secondary fill-current" />
                    <span className="font-semibold text-foreground">
                      {partner.rating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({partner.reviews} avaliações)
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <Button
                  className="w-full gap-2"
                  variant="hero"
                  onClick={() => handleWhatsAppClick(partner.phone, partner.name)}
                >
                  <Phone className="w-4 h-4" />
                  Entrar em Contato
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              Nenhum parceiro encontrado com os filtros selecionados.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
