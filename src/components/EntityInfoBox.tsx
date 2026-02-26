import { useQuery } from "@tanstack/react-query";
import { Building2, Copy, Check, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DONATION_OPTIONS } from "@/hooks/useEntities";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface EntityData {
  id: string;
  name: string;
  city?: string;
  accepted_donations?: string[] | null;
  pix_key?: string | null;
  pix_name?: string | null;
  pix_qr_code_url?: string | null;
  observations?: string | null;
}

interface EntityInfoBoxProps {
  groupCity: string;
  groupDonationType?: string;
  entity?: EntityData | null;
  entityId?: string | null;
}

function getDonationLabel(value: string): string {
  return DONATION_OPTIONS.find(o => o.value === value)?.label || value;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="mt-2 gap-1.5"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copiado!" : "Copiar PIX"}
    </Button>
  );
}

function EntityDetails({ entity }: { entity: EntityData }) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary" />
        {entity.name}
      </h4>

      {entity.accepted_donations && entity.accepted_donations.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Aceita receber:</p>
          <div className="flex flex-wrap gap-1.5">
            {entity.accepted_donations.map((d) => (
              <Badge key={d} variant="secondary" className="text-xs">
                {getDonationLabel(d)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {(entity.pix_key || entity.pix_name) && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          {entity.pix_name && (
            <p className="text-sm">
              <span className="text-muted-foreground">Nome PIX:</span>{" "}
              <span className="font-medium text-foreground">{entity.pix_name}</span>
            </p>
          )}
          {entity.pix_key && (
            <div className="text-sm">
              <p className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Chave PIX:</span>{" "}
                <span className="font-medium text-foreground break-all">{entity.pix_key}</span>
              </p>
              <CopyButton text={entity.pix_key} />
            </div>
          )}
          {entity.pix_qr_code_url && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-xs text-muted-foreground font-medium">QR Code PIX</p>
              <img
                src={entity.pix_qr_code_url}
                alt={`QR Code PIX - ${entity.name}`}
                className="w-48 h-auto rounded-lg border border-border"
              />
            </div>
          )}
          {entity.pix_name && (
            <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
              ⚠️ Antes de concluir a transação, confira se o nome do destinatário corresponde a <strong>{entity.pix_name}</strong>.
            </p>
          )}
        </div>
      )}

      {entity.observations && (
        <p className="text-sm text-muted-foreground italic">{entity.observations}</p>
      )}
    </div>
  );
}

export function EntityInfoBox({ groupCity, groupDonationType, entity, entityId }: EntityInfoBoxProps) {
  // Fetch suggestions only when no entity is selected
  const { data: suggestions } = useQuery({
    queryKey: ["entity-suggestions", groupCity, groupDonationType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities_public")
        .select("*")
        .ilike("city", groupCity);

      if (error) throw error;
      let results = (data || []) as EntityData[];
      
      // Prioritize entities that accept the group's donation type
      if (groupDonationType && results.length > 0) {
        const matching = results.filter(
          (e) => e.accepted_donations && e.accepted_donations.includes(groupDonationType)
        );
        const others = results.filter(
          (e) => !e.accepted_donations || !e.accepted_donations.includes(groupDonationType)
        );
        results = [...matching, ...others];
      }
      
      return results;
    },
    enabled: !entityId && !!groupCity,
  });

  // If entity is selected, show its details
  if (entity && entityId) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
          Instituição Beneficente
        </p>
        <EntityDetails entity={entity} />
      </div>
    );
  }

  // If no entity and no suggestions, don't render
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-accent/30 border border-accent/50 rounded-xl p-4 mt-4">
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
        <Lightbulb className="w-3.5 h-3.5" />
        <span className="text-sm font-bold text-foreground">SUGESTÃO</span> de instituição na sua cidade
      </p>
      <div className="space-y-4">
        {suggestions.map((s) => (
          <EntityDetails key={s.id} entity={s} />
        ))}
      </div>
    </div>
  );
}
