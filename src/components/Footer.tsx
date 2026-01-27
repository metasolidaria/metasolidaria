import { Heart, Settings, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { useIsAdmin } from "@/hooks/useIsAdmin";

// TikTok icon component (not available in Lucide)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/metasolidaria",
    color: "hover:text-pink-400"
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/metasolidaria",
    color: "hover:text-blue-400"
  },
  {
    name: "TikTok",
    icon: TikTokIcon,
    href: "https://tiktok.com/@metasolidaria",
    color: "hover:text-primary-foreground"
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: "https://wa.me/5500000000000",
    color: "hover:text-green-400"
  }
];

export const Footer = () => {
  const { isAdmin } = useIsAdmin();

  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Meta Solidária" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-xl font-bold text-primary-foreground">
              Meta Solidária
            </span>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-primary-foreground/60 ${social.color} transition-colors`}
                aria-label={social.name}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>

          {/* Tagline */}
          <div className="flex items-center gap-1 text-primary-foreground/60 text-sm">
            <span>Feito com</span>
            <Heart className="w-4 h-4 text-secondary" fill="currentColor" />
            <span>para transformar vidas</span>
          </div>

          {/* Copyright and Admin */}
          <div className="flex items-center gap-4">
            <span className="text-primary-foreground/60 text-sm">
              © 2026 Meta Solidária. Todos os direitos reservados.
            </span>
            
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Link 
                  to="/admin/parceiros"
                  className="flex items-center gap-1 text-primary-foreground/40 hover:text-primary-foreground/60 text-xs transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  Parceiros
                </Link>
                <Link 
                  to="/admin/usuarios"
                  className="flex items-center gap-1 text-primary-foreground/40 hover:text-primary-foreground/60 text-xs transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  Usuários
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
