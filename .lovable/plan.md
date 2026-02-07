
# Plano: Aumentar Ainda Mais os Logos e Tratar o Fundo Branco

## Problema Atual
1. **Tamanho**: Logos ainda estão pequenos para o gosto do usuário
2. **Fundo branco**: Aparece porque as imagens são JPG (que não suportam transparência) ou porque há backgrounds residuais no CSS

## Solução Proposta

### 1. Aumentar Tamanho dos Logos

| Componente | Tamanho Atual | Novo Tamanho |
|------------|---------------|--------------|
| **HeroPremiumLogos** | `w-[88px] h-[88px]` | `w-[110px] h-[110px]` |
| **PremiumLogosCarousel** | `w-24 h-24 sm:w-20 sm:h-20` | `w-28 h-28 sm:w-24 sm:h-24` |

### 2. Remover Qualquer Fundo Residual
- Garantir que todas as classes de background sejam transparentes
- Remover bordas que possam criar ilusão de fundo branco
- Aplicar `mix-blend-mode: multiply` para tentar mascarar fundos brancos nas imagens JPG

### 3. Ajustar Containers
- Expandir largura dos containers para acomodar os logos maiores
- `HeroPremiumLogos`: Carousel de `w-[130px]` para `w-[150px]`
- `PremiumLogosCarousel`: Container de `max-w-[280px]` para `max-w-[320px]`

---

## Arquivos a Modificar

### src/components/HeroPremiumLogos.tsx
- Linha 60: Skeleton `w-[88px] h-[88px]` → `w-[110px] h-[110px]`
- Linha 101: Carousel `w-[130px]` → `w-[150px]`
- Linha 115-116: Avatar `w-[88px] h-[88px]` → `w-[110px] h-[110px]`, remover borda
- Linha 121: AvatarImage adicionar `mix-blend-multiply` para mascarar fundo branco

### src/components/PremiumLogosCarousel.tsx
- Linha 94: Carousel `max-w-[280px]` → `max-w-[320px]`
- Linha 108-109: Avatar `w-24 h-24 sm:w-20 sm:h-20` → `w-28 h-28 sm:w-24 sm:h-24`, remover borda
- Linha 114: AvatarImage adicionar `mix-blend-multiply`

---

## Nota Importante sobre Fundo Branco

Se as imagens (`logo.jpg`, `naturuai-logo.jpg`) são arquivos JPG, o fundo branco faz parte da imagem e não pode ser removido via CSS sem efeitos colaterais. 

**Soluções possíveis:**
1. **CSS `mix-blend-multiply`**: Faz o branco ficar "transparente" em fundos claros
2. **Substituir por PNG com transparência**: Solução definitiva, mas requer novas imagens
3. **Remover bordas**: Minimiza a aparência de "caixa branca"
