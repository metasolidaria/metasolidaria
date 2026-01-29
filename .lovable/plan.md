
# Plano de Otimizacao de Performance - 63% para 80%+

## Analise do Diagnostico

Com base na imagem do PageSpeed, identificamos os principais gargalos:

| Issue | Economia | Prioridade |
|-------|----------|------------|
| Ciclos de vida de cache | 1.940 KiB | Media (infra) |
| Entrega de imagens | 1.478 KiB | Alta |
| Solicitacoes de bloqueio | 250 ms | Alta |
| JavaScript nao usado | 112 KiB | Media |
| CSS nao usado | 11 KiB | Baixa |

---

## Problemas Identificados no Codigo

### 1. Imagens ainda importadas de src/assets

Varios componentes ainda importam imagens de `@/assets` ao inves de usar caminhos publicos:

- **Header.tsx** - `import logo from "@/assets/logo.jpg"`
- **Footer.tsx** - `import logo from "@/assets/logo.jpg"`
- **PremiumPartnerSlots.tsx** - `import naturuaiLogo from "@/assets/naturuai-logo.jpg"`
- **PremiumLogosCarousel.tsx** - `import logoImage, naturuaiLogo from "@/assets/..."`
- **PartnersSection.tsx** - `import logoImage, naturuaiLogo from "@/assets/..."`

Essas imagens ja existem em `/public` e devem usar caminhos estaticos.

### 2. framer-motion ainda presente em modais

Embora os modais sejam lazy loaded, o framer-motion ainda e carregado quando eles sao abertos. Componentes afetados:

- `CreateGroupModal.tsx`
- `EditGroupModal.tsx`
- `EditMemberGoalModal.tsx`
- `AddMemberModal.tsx`
- `InviteMemberModal.tsx`
- `RecommendPartnerModal.tsx`
- `ProgressAnalysisModal.tsx`
- `JoinRequestsPanel.tsx`

### 3. Fonte Google Fonts como render-blocking

A fonte "Plus Jakarta Sans" esta sendo carregada via preload, mas o script de fallback noscript ainda pode causar bloqueio.

---

## Solucao Proposta

### Fase 1: Unificar caminhos de imagens (5 arquivos)

Substituir todos os imports de `@/assets` por caminhos estaticos de `/public`:

**Header.tsx:**
```text
// REMOVER
import logo from "@/assets/logo.jpg";

// SUBSTITUIR por
const logo = "/logo.jpg";
```

**Footer.tsx:**
```text
// REMOVER
import logo from "@/assets/logo.jpg";

// SUBSTITUIR por
const logo = "/logo.jpg";
```

**PremiumPartnerSlots.tsx:**
```text
// REMOVER
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

// SUBSTITUIR por
const naturuaiLogo = "/naturuai-logo.jpg";
```

**PremiumLogosCarousel.tsx:**
```text
// REMOVER
import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

// SUBSTITUIR por
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";
```

**PartnersSection.tsx:**
```text
// REMOVER (linha 101-102)
import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

// SUBSTITUIR por
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";
```

### Fase 2: Remover framer-motion dos modais (8 arquivos)

Converter animacoes de `motion.div` e `AnimatePresence` para classes CSS do Tailwind:

**Padrao de conversao:**

```text
// ANTES (framer-motion)
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      ...
    </motion.div>
  )}
</AnimatePresence>

// DEPOIS (CSS)
{open && (
  <div className="animate-in fade-in duration-200">
    ...
  </div>
)}
```

**Arquivos a converter:**

1. `CreateGroupModal.tsx`
2. `EditGroupModal.tsx`
3. `EditMemberGoalModal.tsx`
4. `AddMemberModal.tsx`
5. `InviteMemberModal.tsx`
6. `RecommendPartnerModal.tsx`
7. `ProgressAnalysisModal.tsx`
8. `JoinRequestsPanel.tsx`

### Fase 3: Otimizar carregamento de fonte

Adicionar `font-display: swap` inline e usar estrategia de preload mais agressiva:

**index.html:**
```html
<!-- Preload apenas o subset critico -->
<link 
  rel="preload" 
  href="https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yygg_vb.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin 
/>
```

### Fase 4: Limpar assets duplicados em src/assets

Apos a Fase 1, os seguintes arquivos em `src/assets` podem ser removidos pois ja existem em `public/`:

- `src/assets/logo.jpg` (duplicado de `public/logo.jpg`)
- `src/assets/naturuai-logo.jpg` (duplicado de `public/naturuai-logo.jpg`)

---

## Arquivos a Modificar

### Prioridade Alta (Fase 1):
1. `src/components/Header.tsx` - Usar caminho publico
2. `src/components/Footer.tsx` - Usar caminho publico
3. `src/components/PremiumPartnerSlots.tsx` - Usar caminho publico
4. `src/components/PremiumLogosCarousel.tsx` - Usar caminho publico
5. `src/components/PartnersSection.tsx` - Usar caminho publico

### Prioridade Media (Fase 2):
6. `src/components/CreateGroupModal.tsx` - Remover framer-motion
7. `src/components/EditGroupModal.tsx` - Remover framer-motion
8. `src/components/EditMemberGoalModal.tsx` - Remover framer-motion
9. `src/components/AddMemberModal.tsx` - Remover framer-motion
10. `src/components/InviteMemberModal.tsx` - Remover framer-motion
11. `src/components/RecommendPartnerModal.tsx` - Remover framer-motion
12. `src/components/ProgressAnalysisModal.tsx` - Remover framer-motion
13. `src/components/JoinRequestsPanel.tsx` - Remover framer-motion

### Prioridade Baixa (Fase 3):
14. `index.html` - Otimizar preload de fonte

---

## Impacto Esperado

| Metrica | Atual | Esperado | Economia |
|---------|-------|----------|----------|
| JavaScript nao usado | 112 KiB | 30 KiB | ~80 KiB |
| Entrega de imagens | 1.478 KiB | Melhor cache | - |
| Render-blocking | 250 ms | 100 ms | 150 ms |
| Performance Score | 63% | 75-80% | +12-17% |

---

## Secao Tecnica

### Por que substituir imports de assets por caminhos publicos?

Quando voce usa `import logo from "@/assets/logo.jpg"`, o Vite processa a imagem e:
1. Adiciona um hash ao nome do arquivo (ex: `logo-abc123.jpg`)
2. Inclui a referencia no bundle JavaScript
3. O cache do browser nao funciona bem entre deploys

Usando caminhos estaticos (`const logo = "/logo.jpg"`):
1. O arquivo permanece com nome fixo
2. Headers de cache funcionam melhor
3. O bundle JavaScript fica menor

### Por que remover framer-motion?

O framer-motion adiciona aproximadamente 30-50KB ao bundle. Mesmo com lazy loading, quando o usuario abre um modal, ele precisa baixar essa biblioteca.

Classes CSS como `animate-in fade-in` do Tailwind CSS Animate sao:
1. Ja incluidas no CSS
2. Nao requerem JavaScript adicional
3. Tem performance nativa do browser

### Limitacoes

- **Cache headers**: O problema "ciclos de vida de cache" (1.940 KiB) e configuracao de servidor/CDN, nao codigo
- **Imagem hero**: O problema "entrega de imagens" (1.478 KiB) provavelmente e a hero-donation.webp - pode precisar comprimir mais
