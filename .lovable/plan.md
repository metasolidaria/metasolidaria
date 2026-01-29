

# Plano de Correcao - Regressao de Performance (62% -> 80%+)

## Diagnostico da Queda

A performance caiu de 73% para 62% (PageSpeed) e 56% (Google) devido a varios problemas identificados:

### Problemas Principais Identificados no Screenshot

| Issue | Economia Estimada |
|-------|-------------------|
| Use ciclos de vida eficientes de cache | 1.835 KiB |
| Melhorar a entrega de imagens | 1.385 KiB |
| Reduza o JavaScript nao usado | 125 KiB |
| Renderizar solicitacoes de bloqueio | 160 ms |
| Reduza o CSS nao usado | 11 KiB |

### Causas Tecnicas da Regressao

1. **AuthModal importado diretamente no Index.tsx (linha 6)** - O AuthModal foi migrado de framer-motion, mas continua sendo importado diretamente (nao lazy) no Index.tsx, trazendo todo o codigo para o bundle inicial

2. **framer-motion ainda presente em componentes criticos** - Encontrei 15 arquivos ainda usando framer-motion, incluindo:
   - `HowItWorks.tsx` - Componente com framer-motion (embora nao usado na pagina principal)
   - `GoldPartnersCarousel.tsx` - Usa framer-motion em motion.div

3. **Imagens de logos sendo importadas como modulos** - Em HeroPremiumLogos.tsx e GoldPartnersCarousel.tsx, as imagens logo.jpg e naturuai-logo.jpg sao importadas diretamente, adicionando peso ao bundle

4. **Carousel Autoplay carregado no Hero** - O embla-carousel-autoplay e carregado mesmo para componentes lazy loaded

---

## Solucao Proposta

### Fase 1: Tornar AuthModal lazy no Index.tsx

O AuthModal esta sendo importado diretamente no Index.tsx (linha 6), mas deveria ser lazy loaded como os outros modais.

**Arquivo:** `src/pages/Index.tsx`

```text
// LINHA 6 - REMOVER import direto
import { AuthModal } from "@/components/AuthModal";

// SUBSTITUIR por lazy import (adicionar na secao de lazy imports)
const AuthModal = lazy(() => import("@/components/AuthModal").then(m => ({ default: m.AuthModal })));

// LINHA 126 - Envolver em Suspense
<Suspense fallback={null}>
  <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
</Suspense>
```

### Fase 2: Mover logos para pasta public

As imagens logo.jpg e naturuai-logo.jpg estao em src/assets e sao processadas pelo Vite. Mover para public permite caching melhor e reduz o bundle inicial.

**Acoes:**
1. Copiar `src/assets/logo.jpg` para `public/logo.jpg`
2. Copiar `src/assets/naturuai-logo.jpg` para `public/naturuai-logo.jpg`
3. Atualizar imports para caminhos diretos

**Arquivo:** `src/components/HeroPremiumLogos.tsx`

```text
// REMOVER
import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

// SUBSTITUIR por caminhos diretos
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";
```

**Arquivo:** `src/components/GoldPartnersCarousel.tsx`

```text
// REMOVER
import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

// SUBSTITUIR por caminhos diretos
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";
```

### Fase 3: Converter HowItWorks.tsx para CSS (precaucao)

Embora esse componente nao seja usado diretamente na pagina inicial, ele ainda usa framer-motion. Converter para CSS para evitar que o bundle seja carregado se algum componente o importar.

**Arquivo:** `src/components/HowItWorks.tsx`

```text
// REMOVER
import { motion } from "framer-motion";

// SUBSTITUIR motion.div por div com CSS
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
```

### Fase 4: Converter GoldPartnersCarousel.tsx para CSS

Este componente usa motion.div mas e lazy loaded. Ainda assim, converte-lo remove a dependencia do framer-motion.

**Arquivo:** `src/components/GoldPartnersCarousel.tsx`

```text
// REMOVER
import { motion } from "framer-motion";

// SUBSTITUIR motion.div (linha 63) por div com CSS
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-gradient-to-r ...">
```

### Fase 5: Otimizar carregamento de fontes

Verificar se a fonte esta sendo carregada de forma otimizada no index.html.

**Arquivo:** `index.html`

O preload da fonte ja existe, mas verificar se esta correto:
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'" />
```

---

## Arquivos a Modificar

1. `src/pages/Index.tsx` - Tornar AuthModal lazy loaded
2. `public/logo.jpg` - Copiar de src/assets
3. `public/naturuai-logo.jpg` - Copiar de src/assets
4. `src/components/HeroPremiumLogos.tsx` - Usar caminhos diretos
5. `src/components/GoldPartnersCarousel.tsx` - Remover framer-motion e usar caminhos diretos
6. `src/components/HowItWorks.tsx` - Remover framer-motion

---

## Impacto Esperado

| Metrica | Atual | Esperado |
|---------|-------|----------|
| JavaScript nao usado | 125 KiB | -80 KiB |
| Bundle inicial | ~350 KB | ~280 KB |
| Performance Score | 62% | 75-80% |

---

## Secao Tecnica

### Por que o AuthModal importado diretamente causa problema?

Quando um componente e importado diretamente (sem lazy), ele e incluido no bundle principal junto com todas as suas dependencias. Mesmo que o modal so seja aberto quando o usuario clica em "Entrar", todo o codigo ja esta carregado.

```text
Bundle Principal (sem lazy):
- Index.tsx
- AuthModal.tsx (incluido no bundle inicial)
- CityAutocomplete.tsx
- PasswordStrengthIndicator.tsx
- validations.ts
... todas as dependencias

Bundle Principal (com lazy):
- Index.tsx
- Suspense placeholder

Bundle Separado (carregado sob demanda):
- AuthModal.tsx
- CityAutocomplete.tsx
...
```

### Por que mover imagens para public?

Imagens em src/assets sao processadas pelo Vite e incluidas como data URLs ou modulos JS se forem pequenas. Isso aumenta o tamanho do bundle JavaScript.

Imagens em public sao servidas como arquivos estaticos e podem ter cache headers otimizados pelo servidor.

