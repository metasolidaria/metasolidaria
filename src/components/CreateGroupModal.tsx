import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, MapPin, Target, User, Phone, Gift } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const donationTypes = [
  { id: "alimentos", label: "Alimentos (kg)", icon: "🍎" },
  { id: "livros", label: "Livros (unidades)", icon: "📚" },
  { id: "roupas", label: "Roupas (peças)", icon: "👕" },
  { id: "cobertores", label: "Cobertores (unidades)", icon: "🛏️" },
  { id: "sopas", label: "Sopas (porções)", icon: "🍲" },
  { id: "brinquedos", label: "Brinquedos (unidades)", icon: "🧸" },
  { id: "higiene", label: "Kits de Higiene (unidades)", icon: "🧴" },
  { id: "outro", label: "Outro", icon: "📦" },
];

export const CreateGroupModal = ({ open, onOpenChange }: CreateGroupModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    groupName: "",
    city: "",
    goal: "",
    donationType: "",
    leaderName: "",
    leaderWhatsApp: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedDonation = donationTypes.find(d => d.id === formData.donationType);
    
    toast({
      title: "Grupo criado com sucesso! 🎉",
      description: `O grupo "${formData.groupName}" está pronto para receber participantes. Meta: ${formData.goal} ${selectedDonation?.label.split(" ")[0].toLowerCase() || "itens"}.`,
    });

    setFormData({ 
      groupName: "", 
      city: "", 
      goal: "", 
      donationType: "",
      leaderName: "",
      leaderWhatsApp: "",
    });
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md my-8">
              {/* Header */}
              <div className="bg-gradient-stats p-6 relative rounded-t-2xl">
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
                <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Criar Novo Grupo
                </h2>
                <p className="text-primary-foreground/80 mt-1">
                  Inicie uma jornada de transformação coletiva
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Leader Info Section */}
                <div className="space-y-4 pb-4 border-b border-border">
                  <p className="text-sm font-medium text-muted-foreground">Dados do Líder</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="leaderName" className="text-foreground font-medium">
                      Nome Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="leaderName"
                        placeholder="Seu nome completo"
                        value={formData.leaderName}
                        onChange={(e) =>
                          setFormData({ ...formData, leaderName: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderWhatsApp" className="text-foreground font-medium">
                      WhatsApp
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="leaderWhatsApp"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.leaderWhatsApp}
                        onChange={(e) =>
                          setFormData({ ...formData, leaderWhatsApp: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Group Info Section */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Dados do Grupo</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupName" className="text-foreground font-medium">
                      Nome do Grupo
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="groupName"
                        placeholder="Ex: Equipe Solidária"
                        value={formData.groupName}
                        onChange={(e) =>
                          setFormData({ ...formData, groupName: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground font-medium">
                      Cidade
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="city"
                        placeholder="Ex: São Paulo, SP"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Tipo de Doação
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {donationTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, donationType: type.id })
                          }
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                            formData.donationType === type.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-xl">{type.icon}</span>
                          <span className="text-sm font-medium text-foreground">
                            {type.label.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-foreground font-medium">
                      Meta do Grupo (para 2026)
                    </Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="goal"
                        type="number"
                        placeholder="Ex: 100"
                        value={formData.goal}
                        onChange={(e) =>
                          setFormData({ ...formData, goal: e.target.value })
                        }
                        className="pl-11"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Cada meta alcançada = 1 doação realizada
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="flex-1"
                    disabled={!formData.donationType}
                  >
                    Criar Grupo
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
