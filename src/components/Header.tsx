import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings, HelpCircle, Download, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { HowItWorksModal } from "./HowItWorksModal";
import { DownloadAppModal } from "./DownloadAppModal";
const CreateGroupTutorialModal = lazy(() => import("./CreateGroupTutorialModal").then(m => ({ default: m.CreateGroupTutorialModal })));
const logo = "/logo.jpg";

interface HeaderProps {
  onAuthClick: () => void;
}

export const Header = ({ onAuthClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
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

  const navTextClass = isScrolled ? "text-foreground" : "text-primary-foreground";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-in ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            <img src={logo} alt="Meta Solidária" className="w-10 h-10 rounded-xl object-cover" />
            <span className={`text-xl font-bold transition-colors ${navTextClass}`}>
              Meta Solidária
            </span>
          </div>

          {/* Visible Nav Items - hidden on small mobile */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 z-10">
            <button
              onClick={() => scrollToSection("grupos")}
              className={`text-xs lg:text-sm font-medium px-2 lg:px-3 py-1.5 rounded-lg transition-colors hover:text-primary ${navTextClass}`}
            >
              Grupos
            </button>
            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className={`text-xs lg:text-sm font-medium px-2 lg:px-3 py-1.5 rounded-lg transition-colors hover:text-primary flex items-center gap-1 ${navTextClass}`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Como Funciona
            </button>
            <button
              onClick={() => setIsTutorialOpen(true)}
              className={`text-xs lg:text-sm font-medium px-2 lg:px-3 py-1.5 rounded-lg transition-colors hover:text-primary flex items-center gap-1 ${navTextClass}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Criar Grupo
            </button>
            <button
              onClick={() => setIsDownloadOpen(true)}
              className={`text-xs lg:text-sm font-medium px-2 lg:px-3 py-1.5 rounded-lg transition-colors hover:text-primary flex items-center gap-1 ${navTextClass}`}
            >
              <Download className="w-3.5 h-3.5" />
              Baixar App
            </button>
          </nav>

          {/* Auth Icon + Hamburger */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/perfil")}
                className={isScrolled ? "text-foreground" : "text-primary-foreground hover:text-primary-foreground/80"}
                aria-label="Perfil"
              >
                <User className="w-5 h-5" />
              </Button>
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${navTextClass}`} />
              ) : (
                <Menu className={`w-6 h-6 ${navTextClass}`} />
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="bg-card rounded-xl shadow-soft p-4 mb-4 animate-fade-in">
            {/* User section */}
            {user && (
              <>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                  <button
                    onClick={() => { navigate("/perfil"); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection("grupos")}
                className="md:hidden text-foreground text-left py-2 px-3 rounded-lg hover:bg-muted transition-colors"
              >
                Grupos
              </button>
              {["Instituições", "Parceiros", "Impacto"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(" ", "-"))}
                  className="text-foreground text-left py-2 px-3 rounded-lg hover:bg-muted transition-colors"
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => { setIsHowItWorksOpen(true); setIsMobileMenuOpen(false); }}
                className="md:hidden text-foreground text-left py-2 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Como Funciona
              </button>
              <button
                onClick={() => { setIsTutorialOpen(true); setIsMobileMenuOpen(false); }}
                className="md:hidden flex items-center gap-2 text-foreground text-left py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Criar Grupo
              </button>
              <button
                onClick={() => { setIsDownloadOpen(true); setIsMobileMenuOpen(false); }}
                className="md:hidden flex items-center gap-2 text-foreground text-left py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Download className="w-4 h-4 text-primary" />
                Baixar App
              </button>
            </nav>
          </div>
        )}
      </div>
      <HowItWorksModal open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen} />
      <DownloadAppModal open={isDownloadOpen} onOpenChange={setIsDownloadOpen} />
      <Suspense fallback={null}>
        <CreateGroupTutorialModal open={isTutorialOpen} onOpenChange={setIsTutorialOpen} />
      </Suspense>
    </header>
  );
};
