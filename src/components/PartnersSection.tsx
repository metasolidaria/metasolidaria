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
  Baby,
  Loader2
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { usePartners } from "@/hooks/usePartners";

const categories = [
  { id: "all", label: "Todos", icon: Star },
  { id: "Nutricionista", label: "Nutricionista", icon: Apple },
  { id: "Médico", label: "Médico", icon: Stethoscope },
  { id: "Psicólogo", label: "Psicólogo", icon: Brain },
  { id: "Personal Trainer", label: "Personal Trainer", icon: Dumbbell },
  { id: "Fisioterapeuta", label: "Fisioterapeuta", icon: HeartPulse },
  { id: "Pediatra", label: "Pediatra", icon: Baby },
];

const placeholderImages = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
];

export const PartnersSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchCity, setSearchCity] = useState("");
  const { partners, isLoading } = usePartners();

  const filteredPartners = (partners || []).filter((partner) => {
    const matchesCategory =
      selectedCategory === "all" || partner.specialty === selectedCategory;
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPartners.length > 0 ? (
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
                    src={placeholderImages[index % placeholderImages.length]}
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
                    {partner.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {partner.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Button
                    className="w-full gap-2"
                    variant="hero"
                    onClick={() => handleWhatsAppClick(partner.whatsapp, partner.name)}
                  >
                    <Phone className="w-4 h-4" />
                    Entrar em Contato
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              {partners && partners.length === 0
                ? "Ainda não há parceiros cadastrados."
                : "Nenhum parceiro encontrado com os filtros selecionados."}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
