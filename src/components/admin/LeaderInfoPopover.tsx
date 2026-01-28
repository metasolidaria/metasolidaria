import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Crown, Phone, Mail, ExternalLink } from "lucide-react";

interface LeaderInfoPopoverProps {
  leaderName: string | null;
  leaderWhatsapp: string | null;
  leaderEmail: string | null;
}

const formatWhatsappLink = (whatsapp: string | null): string | null => {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${number}`;
};

export const LeaderInfoPopover = ({
  leaderName,
  leaderWhatsapp,
  leaderEmail,
}: LeaderInfoPopoverProps) => {
  const whatsappLink = formatWhatsappLink(leaderWhatsapp);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-amber-600 hover:text-amber-700"
          title="Informações do líder"
        >
          <Crown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Crown className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-sm">Informações do Líder</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Nome:</span>
              <span className="text-sm text-muted-foreground">
                {leaderName || "Não informado"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  {leaderWhatsapp || "Não informado"}
                </span>
              </div>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                  {leaderEmail || "Não informado"}
                </span>
              </div>
              {leaderEmail && (
                <a
                  href={`mailto:${leaderEmail}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
