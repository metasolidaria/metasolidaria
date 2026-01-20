import { Heart } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Meta Solidária" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-xl font-bold text-primary-foreground">
              Meta Solidária
            </span>
          </div>

          <div className="flex items-center gap-1 text-primary-foreground/60 text-sm">
            <span>Feito com</span>
            <Heart className="w-4 h-4 text-secondary" fill="currentColor" />
            <span>para transformar vidas</span>
          </div>

          <div className="text-primary-foreground/60 text-sm">
            © 2026 Meta Solidária. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};
