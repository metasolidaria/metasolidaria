import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { partnerSpecialties, SPECIALTY_OTHER } from "@/lib/partnerSpecialties";

interface SpecialtySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SpecialtySelect = ({
  value,
  onChange,
  placeholder = "Selecione a especialidade",
}: SpecialtySelectProps) => {
  // Verifica se o valor atual é uma especialidade conhecida
  const isKnownSpecialty = partnerSpecialties.includes(value as typeof partnerSpecialties[number]);
  const isOtherSelected = value && !isKnownSpecialty;

  const [showCustomInput, setShowCustomInput] = useState(isOtherSelected);
  const [customValue, setCustomValue] = useState(isOtherSelected ? value : "");

  // Atualiza o estado quando o valor externo muda
  useEffect(() => {
    const isKnown = partnerSpecialties.includes(value as typeof partnerSpecialties[number]);
    if (value && !isKnown) {
      setShowCustomInput(true);
      setCustomValue(value);
    } else {
      setShowCustomInput(false);
      setCustomValue("");
    }
  }, [value]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === SPECIALTY_OTHER) {
      setShowCustomInput(true);
      setCustomValue("");
      onChange("");
    } else {
      setShowCustomInput(false);
      setCustomValue("");
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue);
  };

  const handleBackToSelect = () => {
    setShowCustomInput(false);
    setCustomValue("");
    onChange("");
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder="Digite a especialidade..."
          autoFocus
        />
        <button
          type="button"
          onClick={handleBackToSelect}
          className="text-xs text-muted-foreground hover:text-primary underline"
        >
          ← Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {partnerSpecialties.map((specialty) => (
          <SelectItem key={specialty} value={specialty}>
            {specialty}
          </SelectItem>
        ))}
        <SelectItem value={SPECIALTY_OTHER} className="text-muted-foreground">
          Outros...
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
