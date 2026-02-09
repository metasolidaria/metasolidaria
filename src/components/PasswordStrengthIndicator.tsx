import { useMemo } from "react";
import { Check, X, Circle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const requirements: Requirement[] = useMemo(() => [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Letra maiúscula", met: /[A-Z]/.test(password) },
    { label: "Letra minúscula", met: /[a-z]/.test(password) },
    { label: "Número", met: /[0-9]/.test(password) },
    { label: "Caractere especial (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "" };
    if (metCount <= 2) return { level: 1, label: "Fraca", color: "bg-destructive" };
    if (metCount <= 4) return { level: 2, label: "Média", color: "bg-yellow-500" };
    return { level: 3, label: "Forte", color: "bg-green-500" };
  }, [requirements]);

  const isEmpty = !password;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar - only show when typing */}
      {!isEmpty && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
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
              strength.level === 1 ? "text-destructive" :
              strength.level === 2 ? "text-yellow-600" :
              "text-green-600"
            }`}>
              Senha {strength.label}
            </p>
          )}
        </div>
      )}

      {/* Requirements checklist */}
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
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "A senha deve conter letra maiúscula";
  if (!/[a-z]/.test(password)) return "A senha deve conter letra minúscula";
  if (!/[0-9]/.test(password)) return "A senha deve conter número";
  if (!/[^A-Za-z0-9]/.test(password)) return "A senha deve conter um caractere especial (!@#$...)";
  return null;
};
