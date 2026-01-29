import { Heart, Settings, Instagram, Facebook, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
const logo = "/logo.jpg";

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

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
    href: "https://www.facebook.com/share/1AYyZ7KxxN/",
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
    icon: WhatsAppIcon,
    href: "https://wa.me/5519994662603?text=Olá! Vim pelo site Meta Solidária.",
    color: "hover:text-green-400"
  }
];

// Lazy load admin section - includes hook to avoid loading admin logic for regular visitors
const AdminSection = lazy(() => 
  Promise.all([
    import("@/components/ui/dropdown-menu"),
    import("@/hooks/useIsAdmin")
  ]).then(([dropdownModule, adminModule]) => ({
    default: () => {
      const { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } = dropdownModule;
      const { useIsAdmin } = adminModule;
      const { isAdmin } = useIsAdmin();
      
      if (!isAdmin) return null;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-primary-foreground/40 hover:text-primary-foreground/60 text-xs transition-colors outline-none">
            <Settings className="w-3 h-3" />
            Admin
            <ChevronDown className="w-3 h-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem asChild>
              <Link to="/admin/grupos" className="cursor-pointer">
                Grupos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/usuarios" className="cursor-pointer">
                Usuários
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/parceiros" className="cursor-pointer">
                Parceiros
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/convites" className="cursor-pointer">
                Convites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/entidades" className="cursor-pointer">
                Entidades
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }))
);

export const Footer = () => {
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
            
            <Suspense fallback={null}>
              <AdminSection />
            </Suspense>
          </div>
        </div>
      </div>
    </footer>
  );
};
