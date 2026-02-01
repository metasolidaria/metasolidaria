import { Target, ArrowRight } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface DefaultCommitmentData {
  name: string;
  metric: string;
  ratio: number;
  donation: number;
  goal: number;
}

interface DefaultCommitmentSectionProps {
  data: DefaultCommitmentData;
  onChange: (data: DefaultCommitmentData) => void;
  donationType: string;
}

const getDonationUnit = (donationType: string): string => {
  switch (donationType) {
    case "alimentos":
      return "kg";
    case "livros":
      return "livro(s)";
    case "roupas":
      return "peça(s)";
    case "cobertores":
      return "cobertor(es)";
    case "sopas":
      return "porção(ões)";
    case "brinquedos":
      return "brinquedo(s)";
    case "higiene":
      return "kit(s)";
    case "mudas":
      return "muda(s)";
    default:
      return "unidade(s)";
  }
};

export const DefaultCommitmentSection = ({
  data,
  onChange,
  donationType,
}: DefaultCommitmentSectionProps) => {
  const donationUnit = getDonationUnit(donationType);
  const hasCommitment = data.metric.trim() !== "";

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <Label className="text-foreground font-medium">
          Meta Padrão para Membros
        </Label>
        <span className="text-xs text-muted-foreground">(opcional)</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Defina uma regra de doação que será aplicada automaticamente a cada novo membro. Eles poderão alterar depois.
      </p>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="commitmentName" className="text-sm text-muted-foreground">
            Nome da meta (opcional)
          </Label>
          <Input
            id="commitmentName"
            placeholder="Ex: Meta de Corridas"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Regra de doação
          </Label>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-foreground whitespace-nowrap">A cada</span>
            <Input
              type="number"
              min="1"
              value={data.ratio}
              onChange={(e) =>
                onChange({ ...data, ratio: Math.max(1, parseInt(e.target.value) || 1) })
              }
              className="w-16 h-9 text-center"
            />
            <Input
              placeholder="corrida, km, gol..."
              value={data.metric}
              onChange={(e) => onChange({ ...data, metric: e.target.value })}
              className="w-32 h-9"
            />
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              type="number"
              min="1"
              value={data.donation}
              onChange={(e) =>
                onChange({ ...data, donation: Math.max(1, parseInt(e.target.value) || 1) })
              }
              className="w-16 h-9 text-center"
            />
            <span className="text-sm text-foreground whitespace-nowrap">{donationUnit}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commitmentGoal" className="text-sm text-muted-foreground">
            Meta inicial sugerida (quantidade de {donationUnit})
          </Label>
          <Input
            id="commitmentGoal"
            type="number"
            min="0"
            value={data.goal}
            onChange={(e) =>
              onChange({ ...data, goal: Math.max(0, parseInt(e.target.value) || 0) })
            }
            className="w-24 h-9"
          />
        </div>
      </div>

      {hasCommitment && (
        <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-medium">📌 Preview:</span>{" "}
            <span className="text-primary font-semibold">
              {data.ratio} {data.metric} = {data.donation} {donationUnit}
            </span>
          </p>
          {data.goal > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Membros entrarão com meta de {data.goal} {donationUnit}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
