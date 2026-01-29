

# Plano de Otimizacao do LCP (11s para 2.5s)

## Diagnostico Atual

A performance subiu de 63% para 73% gracas a remocao do framer-motion dos componentes principais. Porem, o **LCP de 11 segundos** ainda e o maior problema.

### Metricas Atuais

| Metrica | Valor | Status |
|---------|-------|--------|
| FCP | 2.9s | Laranja |
| LCP | 11.0s | Vermelho |
| TBT | 10ms | Verde |
| CLS | 0.083 | Verde |
| Speed Index | 3.7s | Laranja |

O LCP de 11s e causado pela combinacao de:
1. Redirect do dominio customizado (780ms fixo - nao controlavel)
2. Imagem hero nao ter preload no HTML
3. Imagem hero possivelmente muito pesada

---

## Solucao Proposta

### Fase 1: Adicionar Preload da Imagem Hero no HTML

O problema principal e que o browser so descobre que precisa carregar a imagem hero quando o JavaScript executa e renderiza o componente Hero. Adicionar um preload no HTML faz o browser comecar a baixar a imagem imediatamente.

**Arquivo:** `index.html`

Adicionar na secao `<head>`:
```html
<link rel="preload" as="image" type="image/webp" href="/assets/hero-donation-optimized.webp" fetchpriority="high" />
```

Nota: Como o Vite adiciona hash ao nome do arquivo, precisaremos de uma abordagem diferente - adicionar a imagem na pasta public sem hash.

### Fase 2: Mover Imagem Hero para pasta Public

Para que o preload funcione corretamente, a imagem precisa ter um caminho previsivel. 

**Acao:** Copiar `hero-donation-optimized.webp` para `public/hero-donation.webp` e atualizar o Hero.tsx para usar esse caminho.

**Arquivo:** `src/components/Hero.tsx`

```text
// REMOVER import
import heroImage from "@/assets/hero-donation-optimized.webp";

// SUBSTITUIR por caminho direto
const heroImage = "/hero-donation.webp";
```

### Fase 3: Remover framer-motion do HowItWorksModal

Este modal e carregado na pagina inicial via lazy loading, mas ainda traz o framer-motion quando renderizado.

**Arquivo:** `src/components/HowItWorksModal.tsx`

```text
// REMOVER
import { motion } from "framer-motion";

// SUBSTITUIR motion.div por div com animacoes CSS
<div
  className="animate-in fade-in slide-in-from-left-4 duration-300"
  style={{ animationDelay: `${index * 100}ms` }}
>
```

### Fase 4: Remover framer-motion do AuthModal

O AuthModal usa AnimatePresence que e mais complexo. Substituir por CSS transitions.

**Arquivo:** `src/components/AuthModal.tsx`

```text
// REMOVER
import { motion, AnimatePresence } from "framer-motion";

// SUBSTITUIR por renderizacao condicional com CSS
{open && (
  <>
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
```

---

## Arquivos a Modificar

1. `index.html` - Adicionar preload da imagem hero
2. `public/hero-donation.webp` - Copiar imagem otimizada para public
3. `src/components/Hero.tsx` - Usar caminho direto ao inves de import
4. `src/components/HowItWorksModal.tsx` - Remover framer-motion
5. `src/components/AuthModal.tsx` - Remover framer-motion

---

## Impacto Esperado

| Metrica | Atual | Esperado |
|---------|-------|----------|
| LCP | 11.0s | 3-4s |
| FCP | 2.9s | 2.5s |
| Bundle Size | ~45KB framer | -45KB |
| Performance Score | 73% | 80-85% |

O preload da imagem hero e a acao de maior impacto - pode reduzir o LCP em 3-5 segundos.

---

## Secao Tecnica

### Por que o preload funciona?

```text
Sem Preload:
HTML -> CSS -> JS -> React -> Hero Component -> Descoberta da imagem -> Download

Com Preload:
HTML -> [Preload inicia download imediatamente]
     -> CSS -> JS -> React -> Hero Component -> Imagem ja disponivel
```

O browser comeca a baixar a imagem assim que le o HTML, em paralelo com o resto do carregamento.

### Por que mover para public/?

Arquivos em `src/assets/` sao processados pelo Vite e recebem um hash no nome (ex: `hero-donation-CZUDhdgz.webp`). Isso impossibilita o preload no HTML, pois o hash muda a cada build.

Arquivos em `public/` mantem o nome original e podem ser referenciados com caminhos estaticos.

