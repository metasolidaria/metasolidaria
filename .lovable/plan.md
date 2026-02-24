

# Reduzir tamanho das fontes do Hero no mobile

## O que sera feito

Reduzir o tamanho do titulo principal e do paragrafo descritivo na secao Hero para ficarem mais proporcionais em telas de celular.

## Alteracoes

**Arquivo:** `src/components/Hero.tsx`

1. **Titulo principal** - Alterar de `text-4xl md:text-6xl lg:text-7xl` para `text-3xl sm:text-4xl md:text-6xl lg:text-7xl`
   - No mobile: de 36px para 30px

2. **Paragrafo descritivo** - Alterar de `text-lg md:text-xl` para `text-base md:text-xl`
   - No mobile: de 18px para 16px

## Resultado esperado

O texto do Hero ficara mais compacto e proporcional em telas pequenas, sem afetar a aparencia em desktop/tablet.

