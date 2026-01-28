
# Plano: Estabilizar Carrossel de Parceiros Premium no Hero

## Diagnostico

Apos investigacao detalhada:
- O codigo atual esta correto e o carrossel **esta funcionando** na versao mais recente
- A request retorna 3 parceiros premium (NaturUai + Padaria Doce Mel)
- Screenshot confirmou que o logo esta aparecendo ao lado do texto "Transforme suas metas..."

O problema pode ser:
1. Cache do navegador mostrando versao antiga
2. Build nao completamente atualizado no momento da visualizacao
3. Instabilidade visual durante o carregamento da query

## Solucao Proposta

### 1. Adicionar Skeleton Durante Carregamento

Mostrar um placeholder visual enquanto os dados carregam para evitar "pulos" no layout:

```tsx
const HeroPremiumLogos = () => {
  const { data: premiumPartners, isLoading } = usePremiumPartnersHero();
  
  // Mostrar skeleton durante loading ao inves de null
  if (isLoading) {
    return (
      <div className="border-l border-primary-foreground/30 pl-3">
        <Skeleton className="w-12 h-12 rounded-lg bg-primary-foreground/20" />
      </div>
    );
  }
  
  // Se nao houver parceiros, nao exibe nada
  if (!premiumPartners || premiumPartners.length === 0) {
    return null;
  }
  
  // ... resto do codigo
};
```

### 2. Garantir Estabilidade do Plugin Autoplay

Mover a criacao do plugin autoplay para dentro de um `useMemo` para evitar recriacao:

```tsx
const autoplayPlugin = useMemo(
  () => Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true }),
  []
);
```

### 3. Adicionar CSS para Garantir Visibilidade

Garantir que o carousel nao seja cortado pelo `overflow-hidden` do container pai:

```tsx
<motion.div
  className="inline-flex items-center gap-3 ... overflow-visible"
>
```

## Arquivos a Modificar

- `src/components/Hero.tsx`

## Beneficios

1. **Melhor UX**: Usuario ve um placeholder durante o carregamento
2. **Maior estabilidade**: Plugin autoplay nao recria a cada render
3. **Prevencao de bugs visuais**: Evita cortes inesperados no layout

## Teste Recomendado

- Limpar cache do navegador (Ctrl+Shift+R)
- Verificar se o carrossel aparece com o skeleton durante carregamento
- Confirmar que os logos rotacionam a cada 2.5 segundos
