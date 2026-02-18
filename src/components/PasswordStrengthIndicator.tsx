import { useMemo } from "react";
import { Check, X, Circle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

function hasSequentialChars(password: string, length = 3): boolean {
  for (let i = 0; i <= password.length - length; i++) {
    let ascending = true;
    let descending = true;
    for (let j = 1; j < length; j++) {
      if (password.charCodeAt(i + j) !== password.charCodeAt(i + j - 1) + 1) ascending = false;
      if (password.charCodeAt(i + j) !== password.charCodeAt(i + j - 1) - 1) descending = false;
    }
    if (ascending || descending) return true;
  }
  return false;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const requirements: Requirement[] = useMemo(() => [
    { label: "Mínimo 6 caracteres", met: password.length >= 6 },
    { label: "Sem sequências (abc, 123...)", met: password.length > 0 && !hasSequentialChars(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "" };
    if (metCount === 1) return { level: 1, label: "Fraca", color: "bg-destructive" };
    return { level: 2, label: "Forte", color: "bg-green-500" };
  }, [requirements]);

  const isEmpty = !password;

  return (
    <div className="space-y-3 mt-2">
      {!isEmpty && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  strength.level >= level ? strength.color : "bg-muted"
                }`}
              />
            ))}
          </div>
          {strength.label && (
            <p className={`text-xs font-medium ${
              strength.level === 1 ? "text-destructive" : "text-green-600"
            }`}>
              Senha {strength.label}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 text-xs ${
              isEmpty ? "text-muted-foreground" : req.met ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {isEmpty ? (
              <Circle className="w-3 h-3" />
            ) : req.met ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 6) return "A senha deve ter no mínimo 6 caracteres";
  if (hasSequentialChars(password)) return "A senha não pode conter sequências (abc, 123...)";
  return null;
};
