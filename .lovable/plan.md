
# Plano: Aumentar Logos e Remover Fundo Branco

## Resumo
Vou aumentar o tamanho dos logos dos parceiros Premium e remover o fundo branco do Avatar que está aparecendo ao redor das imagens.

## Alterações Propostas

### 1. HeroPremiumLogos.tsx (Hero Section)

| Propriedade | Atual | Proposto |
|-------------|-------|----------|
| Avatar tamanho | `w-[72px] h-[72px]` | `w-[88px] h-[88px]` |
| Avatar fundo | `bg-white/90` | `bg-transparent` |
| Carousel width | `w-[110px]` | `w-[130px]` |
| Skeleton | `w-[72px] h-[72px]` | `w-[88px] h-[88px]` |

### 2. PremiumLogosCarousel.tsx (Header)

| Propriedade | Atual | Proposto |
|-------------|-------|----------|
| Avatar tamanho | `w-20 h-20 sm:w-16 sm:h-16` | `w-24 h-24 sm:w-20 sm:h-20` |
| Avatar fundo | `bg-white` | `bg-transparent` |
| Container max-width | `max-w-[250px]` | `max-w-[280px]` |

## Resumo Visual

- **Tamanho**: +20% em relação ao atual
- **Fundo**: Transparente em vez de branco
- **Containers**: Ajustados para acomodar os novos tamanhos

---

## Detalhes Técnicos

### Arquivos a Modificar
1. `src/components/HeroPremiumLogos.tsx`
2. `src/components/PremiumLogosCarousel.tsx`

### Mudanças Específicas

**HeroPremiumLogos.tsx**:
- Linha 60: Skeleton `w-[72px] h-[72px]` → `w-[88px] h-[88px]`
- Linha 101: Carousel `w-[110px]` → `w-[130px]`
- Linha 116: Avatar `w-[72px] h-[72px]` → `w-[88px] h-[88px]`, remover `bg-white/90` → `bg-transparent`

**PremiumLogosCarousel.tsx**:
- Linha 94: Carousel `max-w-[250px]` → `max-w-[280px]`
- Linha 109: Avatar `w-20 h-20 sm:w-16 sm:h-16` → `w-24 h-24 sm:w-20 sm:h-20`, remover `bg-white` → `bg-transparent`
