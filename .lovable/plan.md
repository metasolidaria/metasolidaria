
# Plano: Adicionar Link "Baixar App" no Header e Footer

## Objetivo

Permitir que usuarios instalem o app PWA diretamente atraves de um link visivel no cabecalho (header) e no rodape (footer), sem depender apenas do prompt automatico que aparece apos 3 segundos.

---

## Onde Adicionar

| Local | Posicao | Comportamento |
|-------|---------|---------------|
| **Header Desktop** | Ao lado de "Impacto" na navegacao | Link discreto que combina com os outros itens |
| **Header Mobile** | Dentro do menu mobile | Opcao de menu como as outras |
| **Footer** | Abaixo das redes sociais | Botao ou link destacado |

---

## Comportamento do Link

O link tera comportamento inteligente baseado no dispositivo:

1. **Android/Chrome** (tem prompt nativo): Ao clicar, dispara o prompt de instalacao nativo do navegador
2. **iOS/Safari** (sem prompt nativo): Ao clicar, abre um modal/tooltip com instrucoes visuais ("Toque em Compartilhar > Adicionar a Tela Inicial")
3. **Ja instalado**: O link nao aparece (oculto)

---

## Implementacao Tecnica

### Etapa 1: Criar Componente InstallAppButton

Um componente reutilizavel que encapsula a logica de instalacao:

```typescript
// src/components/InstallAppButton.tsx
import { Download, Share } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface InstallAppButtonProps {
  variant?: "header" | "footer" | "menu";
  className?: string;
}

export const InstallAppButton = ({ variant, className }: InstallAppButtonProps) => {
  const { isInstallable, isInstalled, isIOSDevice, installApp } = usePWAInstall();
  
  // Nao mostrar se ja instalou
  if (isInstalled) return null;
  
  // Nao mostrar se nao e instalavel E nao e iOS
  if (!isInstallable && !isIOSDevice) return null;

  const handleClick = async () => {
    if (isIOSDevice) {
      // Abre popover com instrucoes (controlado pelo Popover)
      return;
    }
    // Dispara prompt nativo
    await installApp();
  };

  // Para iOS: mostra popover com instrucoes
  // Para Android: botao que dispara instalacao
  // ...renderiza baseado no variant
};
```

### Etapa 2: Adicionar ao Header

No componente Header, adicionar "Baixar App" na navegacao desktop e mobile:

```typescript
// Desktop: adicionar na nav junto com Grupos, Entidades, etc.
<nav className="hidden md:flex items-center gap-4 lg:gap-8 ...">
  {["Grupos", "Entidades", "Parceiros", "Impacto"].map(...)}
  <InstallAppButton variant="header" />
</nav>

// Mobile: adicionar no menu
{isMobileMenuOpen && (
  <nav className="flex flex-col gap-2">
    {["Grupos", "Entidades", "Parceiros", "Impacto"].map(...)}
    <InstallAppButton variant="menu" />
    ...
  </nav>
)}
```

### Etapa 3: Adicionar ao Footer

No Footer, adicionar abaixo dos icones de redes sociais:

```typescript
{/* Social Media Icons */}
<div className="flex items-center gap-6">
  {socialLinks.map(...)}
</div>

{/* Install App Link */}
<InstallAppButton variant="footer" />

{/* Tagline */}
<div className="flex items-center gap-1 ...">
```

---

## Design Visual

### Header (Desktop)
- Aparece como link de texto igual aos outros: "Baixar App" com icone de download
- Cor adapta ao scroll (branco no hero, escuro apos scroll)

### Header (Mobile Menu)
- Aparece como item de menu com destaque verde sutil
- Icone de download + texto "Baixar App"

### Footer
- Botao pequeno com icone de download
- Cor verde (primary) para destacar

### Instrucoes iOS (Popover)
- Quando usuario clica no iOS, aparece um popover explicando:
  - "Toque no icone Compartilhar"
  - "Depois toque em 'Adicionar a Tela Inicial'"
  - Com icones visuais para facilitar

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/InstallAppButton.tsx` | **Novo** - Componente reutilizavel |
| `src/components/Header.tsx` | Adicionar InstallAppButton na nav |
| `src/components/Footer.tsx` | Adicionar InstallAppButton abaixo das redes sociais |

---

## Resultado Esperado

- Usuarios verao "Baixar App" no cabecalho e rodape
- No Android: clique dispara instalacao instantanea
- No iOS: clique mostra instrucoes claras de como instalar
- Link some automaticamente apos o app ser instalado
- Funciona independente do prompt automatico que aparece apos 3 segundos
