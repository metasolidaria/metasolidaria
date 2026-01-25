import { motion } from "framer-motion";
import { Star, Phone } from "lucide-react";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

interface PremiumSlot {
  id: number;
  name: string | null;
  whatsapp: string | null;
  logo: string | null;
  isAvailable: boolean;
}

// Slots premium - apenas parceiros confirmados são exibidos
const premiumSlots: PremiumSlot[] = [
  { id: 1, name: "NaturUai", whatsapp: null, logo: naturuaiLogo, isAvailable: false },
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
      
      <div className="flex justify-center">
        {premiumSlots.map((slot, index) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative rounded-xl p-4 border-2 bg-primary-foreground/15 border-solid border-yellow-400/50 min-w-[180px]"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/50 bg-white flex items-center justify-center">
                <img 
                  src={slot.logo || ""} 
                  alt={slot.name || "Parceiro"} 
                  className="w-full h-full object-contain p-1"
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
            
            {/* Badge de posição */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-primary font-bold text-xs flex items-center justify-center">
              {slot.id}
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
};
