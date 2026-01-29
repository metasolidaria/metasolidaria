import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.jpg";

interface HeaderProps {
  onAuthClick: () => void;
}

export const Header = ({ onAuthClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-in ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 relative">
          {/* Logo */}
          <div className="flex items-center gap-2 z-10">
            <img src={logo} alt="Meta Solidária" className="w-10 h-10 rounded-xl object-cover" />
            <span
              className={`text-xl font-bold transition-colors ${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              Meta Solidária
            </span>
          </div>

          {/* Desktop Navigation - Centered absolutely */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8 absolute left-1/2 -translate-x-1/2">
            {["Grupos", "Entidades", "Parceiros", "Impacto"].map((item) => (
              <button
                key={item}
                onClick={() =>
                  scrollToSection(item.toLowerCase().replace(" ", "-"))
                }
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 z-10">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/perfil")}
                  className={`max-w-[140px] ${isScrolled ? "text-foreground" : "text-primary-foreground hover:text-primary-foreground/80"}`}
                >
                  <Settings className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </Button>
                <Button
                  variant={isScrolled ? "outline" : "hero-outline"}
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </>
            ) : (
              <Button
                variant={isScrolled ? "default" : "hero-outline"}
                size="sm"
                onClick={onAuthClick}
              >
                <User className="w-4 h-4" />
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                }`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                }`}
              />
            )}
          </button>
        </div>

        {/* Mobile Menu - CSS animation instead of framer-motion */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card rounded-xl shadow-soft p-4 mb-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {["Grupos", "Entidades", "Parceiros", "Impacto"].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollToSection(item.toLowerCase().replace(" ", "-"))
                  }
                  className="text-foreground text-left py-2 px-3 rounded-lg hover:bg-muted transition-colors"
                >
                  {item}
                </button>
              ))}
              {user ? (
                <>
                  <div className="border-t border-border mt-2 pt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/perfil");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {user.user_metadata?.full_name || user.email}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  className="mt-2"
                  onClick={() => {
                    onAuthClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4" />
                  Entrar
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
