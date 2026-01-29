
# Plano de Recuperacao da Performance

## Diagnostico da Queda de Performance

A queda de 66 para 63 (mobile) e 95 para 86 (desktop) foi causada por dois fatores principais:

### Problema 1: Imagem hero-donation-optimized.webp Possivelmente Grande

A imagem criada pode nao ter sido comprimida adequadamente. Precisa ser uma versao realmente otimizada com:
- Resolucao maxima de 1920x1080
- Compressao WebP de qualidade 75-80%
- Tamanho alvo: menos de 150KB

### Problema 2: framer-motion em Componentes Criticos da Pagina Inicial

Os seguintes componentes ainda usam framer-motion e sao carregados na pagina inicial:

| Componente | Status | Impacto |
|------------|--------|---------|
| ImpactCounter.tsx | USA framer-motion | Alto (acima da dobra) |
| GroupsSection.tsx | USA framer-motion | Medio |
| EntitiesSection.tsx | USA framer-motion | Medio |
| PartnersSection.tsx | USA framer-motion | Medio |
| PremiumPartnerSlots.tsx | USA framer-motion | Alto (dentro ImpactCounter) |

Mesmo usando lazy loading para esses componentes, quando eles sao renderizados, o framer-motion (~45KB) e carregado, impactando o TTI.

---

## Solucao Proposta

### Fase 1: Converter ImpactCounter para CSS Animations

O ImpactCounter esta acima da dobra e usa framer-motion extensivamente. Substituir por animacoes CSS nativas:

**Arquivo:** `src/components/ImpactCounter.tsx`

```text
// REMOVER
import { motion } from "framer-motion";

// SUBSTITUIR motion.div por div com classes CSS
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
```

### Fase 2: Converter PremiumPartnerSlots para CSS Animations

**Arquivo:** `src/components/PremiumPartnerSlots.tsx`

```text
// REMOVER
import { motion } from "framer-motion";

// SUBSTITUIR motion.div por div com classes CSS
<div className="animate-in fade-in zoom-in-95 duration-300" style={{ animationDelay: '100ms' }}>
```

### Fase 3: Converter GroupsSection para CSS Animations

**Arquivo:** `src/components/GroupsSection.tsx`

Substituir todas as ocorrencias de `motion.div` por `div` com classes do tailwindcss-animate.

### Fase 4: Converter EntitiesSection para CSS Animations

**Arquivo:** `src/components/EntitiesSection.tsx`

Substituir todas as ocorrencias de `motion.div` por `div` com classes do tailwindcss-animate.

### Fase 5: Converter PartnersSection para CSS Animations

**Arquivo:** `src/components/PartnersSection.tsx`

Substituir todas as ocorrencias de `motion.div` por `div` com classes do tailwindcss-animate.

---

## Animacoes CSS Equivalentes

O plugin `tailwindcss-animate` ja esta instalado e fornece:

| framer-motion | CSS Equivalent |
|---------------|----------------|
| `initial={{ opacity: 0 }}` + `animate={{ opacity: 1 }}` | `animate-in fade-in` |
| `initial={{ y: 20 }}` + `animate={{ y: 0 }}` | `slide-in-from-bottom-5` |
| `initial={{ scale: 0.9 }}` + `animate={{ scale: 1 }}` | `zoom-in-90` |
| `transition={{ delay: 0.2 }}` | `style={{ animationDelay: '200ms' }}` |
| `whileInView` | Usar Intersection Observer ou remover (menos critico) |

---

## Resumo de Arquivos a Modificar

1. `src/components/ImpactCounter.tsx` - Remover framer-motion, usar CSS
2. `src/components/PremiumPartnerSlots.tsx` - Remover framer-motion, usar CSS
3. `src/components/GroupsSection.tsx` - Remover framer-motion, usar CSS
4. `src/components/EntitiesSection.tsx` - Remover framer-motion, usar CSS
5. `src/components/PartnersSection.tsx` - Remover framer-motion, usar CSS

---

## Impacto Esperado

- **Bundle Inicial**: Reducao de ~45KB (framer-motion nao sera carregado para a pagina inicial)
- **TTI**: Melhoria significativa com menos JavaScript para processar
- **FCP/LCP**: Melhoria com animacoes CSS nativas que nao bloqueiam a thread principal

---

## Secao Tecnica

### Por que framer-motion impacta tanto a performance?

1. **Tamanho do bundle**: ~45KB minificado
2. **Processamento JS**: Cria sistema de animacao em JavaScript que compete com a renderizacao
3. **Hidratacao**: Precisa hidratar todos os componentes motion antes de interatividade

### Como funciona tailwindcss-animate?

O plugin adiciona classes que usam CSS @keyframes nativos:
- `animate-in` - Ativa a animacao de entrada
- `fade-in` - Opacidade de 0 para 1
- `slide-in-from-bottom-X` - Desliza de baixo para cima
- `zoom-in-XX` - Escala de XX% para 100%
- `duration-XXX` - Duracao da animacao

Essas animacoes sao processadas pela GPU, nao pela thread JavaScript.

