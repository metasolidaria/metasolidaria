
# Plano: Aumentar Logos dos Parceiros Premium nos Carrosséis

## Resumo
Vou aumentar o tamanho dos logos dos parceiros Premium em todos os carrosséis e ajustar o estilo para eliminar o fundo branco que aparece ao redor das imagens.

## Alterações Propostas

### 1. PremiumLogosCarousel.tsx (Header)
**Localização**: `src/components/PremiumLogosCarousel.tsx`

| Atual | Proposto |
|-------|----------|
| Avatar: `w-16 h-16 sm:w-12 sm:h-12` | Avatar: `w-20 h-20 sm:w-16 sm:h-16` |
| AvatarImage: `p-1` | AvatarImage: `p-0` |
| Carousel: `max-w-[200px]` | Carousel: `max-w-[250px]` |

### 2. HeroPremiumLogos.tsx (Hero Section)
**Localização**: `src/components/HeroPremiumLogos.tsx`

| Atual | Proposto |
|-------|----------|
| Avatar: `w-14 h-14` | Avatar: `w-18 h-18` (ou `w-[72px] h-[72px]`) |
| AvatarImage: `p-1` | AvatarImage: `p-0` |
| Carousel: `w-[90px]` | Carousel: `w-[110px]` |
| Skeleton: `w-12 h-12` | Skeleton: `w-[72px] h-[72px]` |

### 3. GoldPartnersCarousel.tsx (Página do Grupo)
**Localização**: `src/components/GoldPartnersCarousel.tsx`

| Atual | Proposto |
|-------|----------|
| Avatar: `w-16 h-16` | Avatar: `w-20 h-20` |
| AvatarImage: `p-1.5` | AvatarImage: `p-0` |

## Resumo Visual das Mudanças

- **Tamanho**: Aumento de aproximadamente 25-30% em todos os avatares
- **Padding**: Removido o padding interno que causava a borda branca
- **Containers**: Ajustados para acomodar os novos tamanhos

---

## Detalhes Técnicos

### Arquivos a Modificar
1. `src/components/PremiumLogosCarousel.tsx`
2. `src/components/HeroPremiumLogos.tsx`
3. `src/components/GoldPartnersCarousel.tsx`

### Mudanças Específicas

**PremiumLogosCarousel.tsx**:
- Linha 81: `max-w-[200px]` → `max-w-[250px]`
- Linha 89: `w-16 h-16 sm:w-12 sm:h-12` → `w-20 h-20 sm:w-16 sm:h-16`
- Linha 95: `p-1` → remover ou usar `p-0`

**HeroPremiumLogos.tsx**:
- Linha 59: `w-12 h-12` → `w-[72px] h-[72px]`
- Linha 88: `w-[90px]` → `w-[110px]`
- Linha 96: `w-14 h-14` → `w-[72px] h-[72px]`
- Linha 102: `p-1` → remover ou usar `p-0`

**GoldPartnersCarousel.tsx**:
- Linha 124: `w-16 h-16` → `w-20 h-20`
- Linha 128: `p-1.5` → remover ou usar `p-0`
