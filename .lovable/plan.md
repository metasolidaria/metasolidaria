
# Plano: Corrigir Click do Instagram nos Carrosséis Premium

## Problema Identificado
O Embla Carousel usa eventos de pointer/touch para detectar arrastos (swipe), e está interceptando os cliques mesmo com `e.stopPropagation()`. Quando você clica no logo, o carousel interpreta como início de arrasto.

## Solução Proposta
Implementar detecção de clique real vs. arrasto usando:
1. Rastrear posição do mouse/touch no `onPointerDown`
2. No `onPointerUp`, calcular se houve movimento significativo
3. Se não houve movimento (< 5px), é um clique real → abrir Instagram
4. Se houve movimento, é um arrasto → ignorar

## Arquivos a Modificar

### 1. src/components/HeroPremiumLogos.tsx
- Adicionar refs para rastrear posição inicial do clique
- Substituir `onClick` por `onPointerDown` + `onPointerUp`
- Implementar lógica de detecção clique vs. arrasto

### 2. src/components/PremiumLogosCarousel.tsx
- Mesma lógica do HeroPremiumLogos

---

## Detalhes Técnicos

### Nova Lógica de Clique

```typescript
// Rastrear posição inicial
const pointerStartPos = useRef<{ x: number; y: number } | null>(null);

const handlePointerDown = (e: React.PointerEvent) => {
  pointerStartPos.current = { x: e.clientX, y: e.clientY };
};

const handlePointerUp = (e: React.PointerEvent, partner: Partner) => {
  if (!pointerStartPos.current) return;
  
  const dx = Math.abs(e.clientX - pointerStartPos.current.x);
  const dy = Math.abs(e.clientY - pointerStartPos.current.y);
  
  // Se movimento < 5px em ambos eixos, é um clique
  if (dx < 5 && dy < 5) {
    handleInstagramClick(partner);
  }
  
  pointerStartPos.current = null;
};
```

### Mudanças no JSX

```jsx
<button
  type="button"
  onPointerDown={handlePointerDown}
  onPointerUp={(e) => handlePointerUp(e, partner)}
  className="focus:outline-none touch-none"
  aria-label={`Visitar Instagram de ${partner.name}`}
>
```

### Benefícios
- Funciona em desktop (mouse) e mobile (touch)
- Não interfere com o arrasto do carousel
- Mantém acessibilidade com `aria-label`

