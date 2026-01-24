import { motion } from "framer-motion";
import { Building2, Star, Phone } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

interface PremiumSlot {
  id: number;
  name: string | null;
  whatsapp: string | null;
  isAvailable: boolean;
}

// Slots premium - podem ser configurados para exibir parceiros específicos
// Por enquanto, mostram como "disponível" até serem preenchidos
const premiumSlots: PremiumSlot[] = [
  { id: 1, name: null, whatsapp: null, isAvailable: true },
  { id: 2, name: null, whatsapp: null, isAvailable: true },
  { id: 3, name: null, whatsapp: null, isAvailable: true },
  { id: 4, name: null, whatsapp: null, isAvailable: true },
];

export const PremiumPartnerSlots = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h3 className="text-lg font-semibold text-primary-foreground">
          Parceiros Premium
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {premiumSlots.map((slot, index) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`
              relative rounded-xl p-4 border-2 transition-all duration-300
              ${slot.isAvailable 
                ? "bg-primary-foreground/5 border-dashed border-primary-foreground/30 hover:border-primary-foreground/50" 
                : "bg-primary-foreground/15 border-solid border-yellow-400/50"
              }
            `}
          >
            {slot.isAvailable ? (
              // Slot disponível
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px] gap-2">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground/40" />
                </div>
                <span className="text-sm text-primary-foreground/60 font-medium">
                  Espaço Disponível
                </span>
                <span className="text-xs text-primary-foreground/40">
                  Seja um parceiro premium
                </span>
              </div>
            ) : (
              // Slot preenchido com parceiro
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400/50">
                  <img 
                    src={logoImg} 
                    alt={slot.name || "Parceiro"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-semibold text-primary-foreground">
                  {slot.name}
                </span>
                {slot.whatsapp && (
                  <a
                    href={`https://wa.me/55${slot.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                  >
                    <Phone className="w-3 h-3" />
                    Contato
                  </a>
                )}
              </div>
            )}
            
            {/* Badge de posição */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-primary font-bold text-xs flex items-center justify-center">
              {slot.id}
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="text-xs text-primary-foreground/50 text-center mt-3">
        Entre em contato para anunciar aqui
      </p>
    </div>
  );
};
