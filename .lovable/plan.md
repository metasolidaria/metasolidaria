
# Plano de Correção - Performance Mobile 90%

## Diagnóstico: Por que ainda está em 64%?

### Problema 1: Animações CSS Inexistentes
As classes `animate-fade-in` e `animate-scale-in` foram adicionadas ao Hero.tsx e Header.tsx, mas **não foram definidas** no `tailwind.config.ts`. O plugin `tailwindcss-animate` usa sintaxe diferente (`animate-in fade-in`), então essas classes não fazem nada.

**Arquivos afetados:**
- src/components/Hero.tsx (linhas 38, 65, 66, 104)
- src/components/Header.tsx (linhas 38, 135)

### Problema 2: HeroStats ainda usa framer-motion
O componente `HeroStats.tsx` ainda importa e usa `motion` de framer-motion na linha 2:
```tsx
import { motion } from "framer-motion";
```
Isso carrega ~45KB de JavaScript assim que o componente é renderizado.

### Problema 3: useIsAdmin no Footer
O Footer.tsx importa `useIsAdmin` diretamente (linha 5), fazendo com que a lógica de admin seja carregada para todos os visitantes.

---

## Solução Proposta

### Fase 1: Definir keyframes de animação no Tailwind

**Arquivo:** `tailwind.config.ts`

Adicionar os keyframes e animações necessários:
- `fade-in`: Para entrada suave com opacity
- `scale-in`: Para entrada com escala

```text
keyframes: {
  // ... existentes ...
  "fade-in": {
    "from": { opacity: "0" },
    "to": { opacity: "1" }
  },
  "scale-in": {
    "from": { opacity: "0", transform: "scale(0.95)" },
    "to": { opacity: "1", transform: "scale(1)" }
  }
}

animation: {
  // ... existentes ...
  "fade-in": "fade-in 0.5s ease-out forwards",
  "scale-in": "scale-in 0.3s ease-out forwards"
}
```

### Fase 2: Remover framer-motion do HeroStats

**Arquivo:** `src/components/HeroStats.tsx`

Substituir:
```tsx
import { motion } from "framer-motion";
// ...
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6, duration: 0.5 }}
  className="flex flex-wrap..."
>
```

Por:
```tsx
// Remover import do motion
<div className="flex flex-wrap... animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
```

### Fase 3: Lazy load useIsAdmin no Footer

**Arquivo:** `src/components/Footer.tsx`

Mover a lógica de admin para dentro do componente lazy, evitando que o hook seja executado para visitantes normais.

### Fase 4: Corrigir InstallPWAPrompt com forwardRef

O console mostra um warning sobre refs no InstallPWAPrompt. Isso não afeta performance diretamente, mas indica um problema com o lazy loading.

**Arquivo:** `src/components/InstallPWAPrompt.tsx`

Envolver o componente com `forwardRef` para suportar corretamente o lazy loading.

---

## Resumo de Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| tailwind.config.ts | Adicionar keyframes fade-in e scale-in |
| src/components/HeroStats.tsx | Remover framer-motion, usar CSS animations |
| src/components/Footer.tsx | Mover useIsAdmin para dentro do lazy component |
| src/components/InstallPWAPrompt.tsx | Adicionar forwardRef para compatibilidade |

---

## Impacto Esperado

- **Bundle inicial**: Redução de ~45KB (framer-motion não será carregado imediatamente)
- **FCP**: Melhoria com animações CSS nativas funcionando corretamente
- **LCP**: Melhoria com menos JavaScript bloqueando a renderização

---

## Seção Técnica

### Por que as animações não funcionavam?

O Tailwind só gera CSS para classes que existem na configuração ou nos plugins. As classes `animate-fade-in` e `animate-scale-in` eram classes inventadas que não correspondiam a nenhuma animação real.

### Sintaxe do tailwindcss-animate

O plugin usa uma sintaxe composta:
- `animate-in` ou `animate-out` para ativar a animação
- `fade-in`, `zoom-in`, `slide-in-from-*` para definir o tipo
- `duration-*` e `delay-*` para timing

Exemplo: `animate-in fade-in slide-in-from-bottom-4 duration-500`

### Por que definir keyframes customizados?

Para manter compatibilidade com o código existente que usa `animate-fade-in` como classe única, definiremos os keyframes diretamente no config, evitando refatoração massiva de todos os componentes.
