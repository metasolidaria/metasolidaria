

# Plano: Corrigir Carrossel de Parceiros Premium no Hero

## Problema Identificado

A caixa do carrossel está desaparecendo porque:
1. A div container com a borda (`border-l`) é sempre renderizada
2. Quando o componente `HeroPremiumLogos` retorna `null` (durante loading ou sem parceiros), a div fica vazia mas ainda ocupa espaço
3. O carrossel pode estar "cortando" o conteúdo visualmente devido ao `overflow-hidden`

## Solucao Proposta

Mover a logica de renderizacao condicional para fora do componente, de forma que toda a secao do carrossel (incluindo a borda) so apareca quando houver parceiros para exibir.

## Alteracoes

### 1. Modificar `src/components/Hero.tsx`

**Atualizar o componente HeroPremiumLogos:**
- Exportar uma funcao auxiliar para verificar se ha parceiros
- Ou incluir a div container dentro do componente para que tudo seja renderizado ou nada

**Opcao escolhida - Incluir container no componente:**

```tsx
// Antes (problema)
<div className="border-l border-primary-foreground/30 pl-3">
  <HeroPremiumLogos />  {/* Pode retornar null */}
</div>

// Depois (solucao)
<HeroPremiumLogos />  {/* Componente ja inclui o container com borda */}
```

O componente `HeroPremiumLogos` passara a renderizar a div com borda internamente, garantindo que:
- Se nao houver parceiros, nada e exibido (nem a borda)
- Se houver parceiros, a borda e o carrossel aparecem juntos

## Detalhes Tecnicos

```tsx
const HeroPremiumLogos = () => {
  const { data: premiumPartners, isLoading } = usePremiumPartnersHero();
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Retorna null se nao houver parceiros (nao exibe nada)
  if (isLoading || !premiumPartners || premiumPartners.length === 0) {
    return null;
  }

  // ... resto do codigo ...

  return (
    // Container com borda agora esta DENTRO do componente
    <div className="border-l border-primary-foreground/30 pl-3">
      <TooltipProvider delayDuration={100}>
        <Carousel ...>
          ...
        </Carousel>
      </TooltipProvider>
    </div>
  );
};
```

E no JSX do Hero, remover a div container:
```tsx
<motion.div className="inline-flex items-center gap-3 ...">
  <Heart className="w-4 h-4 text-secondary" fill="currentColor" />
  <span className="text-primary-foreground text-sm font-medium">
    Transforme suas metas em solidariedade
  </span>
  <HeroPremiumLogos />  {/* Sem div wrapper */}
</motion.div>
```

## Resultado Esperado

- Quando houver parceiros premium: a caixa com borda e carrossel aparece
- Quando nao houver parceiros ou durante o loading: nada extra e exibido
- A animacao do carrossel continuara funcionando normalmente

