
# Plano: Corrigir Tamanho dos Logos Premium

## Problema Identificado

O componente `Avatar` base tem classes padrão `h-10 w-10` (40px) que estão competindo com as classes customizadas. No Tailwind CSS, quando há conflito de classes, a que foi gerada por último no CSS ganha, não a que está por último na string de classes.

### Código atual do Avatar base:
```tsx
// src/components/ui/avatar.tsx linha 12
className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
```

## Solução

Usar a notação `!important` do Tailwind (`!w-[110px] !h-[110px]`) para forçar o tamanho, ou usar estilos inline que sempre têm precedência.

**Opção escolhida: Estilos inline** - mais confiável e sem efeitos colaterais.

---

## Alterações Propostas

### 1. HeroPremiumLogos.tsx

**Avatar (linha 115-116):**
```tsx
// De:
className={`w-[110px] h-[110px] rounded-lg bg-transparent...`}

// Para:
style={{ width: 110, height: 110 }}
className={`rounded-lg bg-transparent...`}
```

**Skeleton placeholder (linha 60):**
```tsx
// De:
className="w-[110px] h-[110px]..."

// Para:
style={{ width: 110, height: 110 }}
className="rounded-lg..."
```

**LogoPlaceholder no Hero.tsx (linha 19):**
```tsx
// De:
className="w-12 h-12..."

// Para:
style={{ width: 110, height: 110 }}
className="rounded-lg..."
```

### 2. PremiumLogosCarousel.tsx

**Avatar (linha 108-109):**
```tsx
// De:
className={`w-28 h-28 sm:w-24 sm:h-24...`}

// Para usar tamanhos inline com media query via clsx:
style={{ width: 112, height: 112 }} // 28 * 4 = 112px (w-28)
className={`rounded-lg bg-transparent...`}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/HeroPremiumLogos.tsx` | Usar `style={{ width: 110, height: 110 }}` no Avatar e Skeleton |
| `src/components/PremiumLogosCarousel.tsx` | Usar `style={{ width: 112, height: 112 }}` no Avatar |
| `src/components/Hero.tsx` | Atualizar `LogoPlaceholder` para usar mesmo tamanho |

---

## Detalhes Técnicos

### Por que estilos inline?
1. Estilos inline sempre têm precedência sobre classes CSS
2. Não dependem da ordem de geração do Tailwind
3. São mais previsíveis e debugáveis

### Tamanhos finais
- **HeroPremiumLogos**: 110px x 110px
- **PremiumLogosCarousel**: 112px x 112px (equivalente a `w-28`)
