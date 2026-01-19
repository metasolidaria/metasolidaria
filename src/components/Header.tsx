import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onAuthClick: () => void;
}

export const Header = ({ onAuthClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              Meta Solidária
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Como Funciona", "Grupos", "Parceiros", "Impacto"].map((item) => (
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
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className={`text-sm ${isScrolled ? "text-foreground" : "text-primary-foreground"}`}>
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-card rounded-xl shadow-soft p-4 mb-4"
          >
            <nav className="flex flex-col gap-2">
              {["Como Funciona", "Grupos", "Parceiros", "Impacto"].map((item) => (
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
                    <span className="text-sm text-muted-foreground px-3">
                      {user.user_metadata?.full_name || user.email}
                    </span>
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
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};
