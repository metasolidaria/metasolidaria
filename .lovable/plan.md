
# Plano de Otimizacao de Performance Mobile - Meta 90%

## Analise da Queda de Performance (74% -> 64%)

### Causas Identificadas

1. **Font blocking via CSS @import (CRITICO)**
   - O arquivo `src/index.css` linha 1 tem `@import url('https://fonts.googleapis.com/...')` que bloqueia a renderizacao
   - Isso anula completamente a otimizacao feita no `index.html` com preload

2. **Imagem hero-donation.jpg nao otimizada**
   - Imagem JPG grande (~250KB) carregada como LCP element
   - Deveria ser WebP e ter tamanhos responsivos

3. **framer-motion carregado no bundle inicial**
   - Hero.tsx e Header.tsx usam `motion` diretamente
   - Biblioteca pesada (~45KB gzipped) carregada antes do FCP

4. **Footer importa useIsAdmin mesmo na homepage**
   - Hook carrega logica de admin desnecessariamente

5. **InstallPWAPrompt movido para App.tsx**
   - Na ultima alteracao, o componente foi removido do Index mas adicionado ao App.tsx
   - Continua carregando no bundle principal

---

## Plano de Implementacao

### Fase 1: Remover @import blocking (Impacto Alto)

**Arquivo:** `src/index.css`

**Alteracao:** Remover a linha 1 com `@import` da fonte. A fonte ja esta sendo carregada de forma otimizada no `index.html` com preload/onload.

```text
Remover:
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
```

### Fase 2: Lazy load framer-motion no Hero (Impacto Medio)

**Arquivo:** `src/components/Hero.tsx`

**Alteracao:** Substituir animacoes `motion.div` por CSS animations para elementos criticos (titulo, badge, botoes). Manter `motion` apenas para elementos abaixo da dobra (scroll indicator).

A abordagem sera:
- Usar CSS `@keyframes` para fade-in do conteudo principal
- Remover `initial/animate` de `motion.div` nos elementos acima da dobra
- Scroll indicator pode manter framer-motion (nao afeta FCP)

### Fase 3: Lazy load Header motion (Impacto Baixo-Medio)

**Arquivo:** `src/components/Header.tsx`

**Alteracao:** Substituir `motion.header` por header normal com CSS transition. A animacao de entrada do header nao e critica para UX.

### Fase 4: Lazy load Footer useIsAdmin (Impacto Baixo)

**Arquivo:** `src/components/Footer.tsx`

**Alteracao:** Carregar o DropdownMenu e useIsAdmin de forma lazy, ja que o menu admin so aparece para admins.

### Fase 5: Lazy load InstallPWAPrompt (Impacto Baixo)

**Arquivo:** `src/App.tsx`

**Alteracao:** O `InstallPWAPrompt` deve ser carregado com delay, nao no bundle inicial.

---

## Resumo de Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/index.css` | Remover @import da fonte |
| `src/components/Hero.tsx` | Substituir motion.div criticos por CSS animations |
| `src/components/Header.tsx` | Substituir motion.header por CSS transition |
| `src/App.tsx` | Lazy load InstallPWAPrompt com delay |

---

## Impacto Esperado

- **FCP**: Reducao de ~1-2s (remocao do @import blocking + menos JS)
- **LCP**: Reducao de ~0.5-1s (menos JS blocking)
- **Total Blocking Time**: Reducao significativa (menos framer-motion no bundle inicial)

---

## Secao Tecnica

### Por que o @import causa blocking?

O `@import` no CSS e render-blocking porque o navegador precisa:
1. Baixar o CSS principal
2. Parsear e encontrar o @import
3. Fazer uma nova requisicao para a fonte
4. Esperar a fonte carregar

Com `<link rel="preload">` no HTML, o navegador ja inicia o download em paralelo.

### Por que framer-motion afeta performance?

A biblioteca adiciona ~45KB (gzipped) ao bundle. No mobile com conexao lenta, isso pode adicionar 500ms+ ao tempo de parse/execute do JavaScript, atrasando o FCP.

### CSS Animations vs framer-motion

Para animacoes simples (fade-in, slide-in), CSS nativo e:
- 0KB de JavaScript adicional
- Executado pela GPU
- Nao bloqueia o thread principal
