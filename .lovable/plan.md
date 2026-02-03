
# Plano: Parceiros Dinamicos com Rotacao Automatica

## Objetivo
Modificar o componente `PremiumPartnerSlots` para exibir parceiros de forma dinamica, mostrando **um parceiro por vez** no topo com rotacao automatica. A prioridade sera: primeiro todos os parceiros **Premium**, depois os parceiros **Ouro**.

## Comportamento Desejado

1. **Ordenacao por prioridade**: Premium primeiro, Ouro depois
2. **Rotacao automatica**: A cada X segundos (ex: 4s), muda para o proximo parceiro
3. **Exibicao individual**: Mostra apenas um parceiro por vez com animacao de transicao suave
4. **Loop infinito**: Apos o ultimo parceiro, volta ao primeiro

## Layout Visual

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ⭐ Parceiros Premium & Ouro                               │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │    [Logo]                           │             │
│         │    Nome do Parceiro                 │             │
│         │    Especialidade                    │             │
│         │    [Badge: Premium ou Ouro]         │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│                    • • ○ • •  (indicadores)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Apos 4 segundos: fade-out -> proximo parceiro -> fade-in
```

## Alteracoes

### Arquivo: `src/components/PremiumPartnerSlots.tsx`

| Mudanca | Descricao |
|---------|-----------|
| Query expandida | Buscar parceiros Premium E Ouro (nao apenas Premium) |
| Ordenacao | Ordenar por tier (premium primeiro) e depois por nome |
| Estado de rotacao | Adicionar `currentIndex` com `setInterval` para rotacao automatica |
| Exibicao individual | Mostrar apenas o parceiro atual (nao carousel) |
| Animacao de transicao | Usar `animate-in fade-in` para entrada suave |
| Indicadores | Adicionar pontos indicadores do parceiro atual |
| Badge de tier | Mostrar se e Premium ou Ouro |

## Detalhes Tecnicos

### 1. Query modificada para buscar Premium e Ouro:

```typescript
const useAllPremiumAndGoldPartners = () => {
  return useQuery({
    queryKey: ["allPremiumGoldPartnersSlots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_public")
        .select("id, name, logo_url, specialty, instagram, whatsapp, tier, is_test")
        .eq("is_approved", true)
        .in("tier", ["premium", "ouro"])
        .order("name", { ascending: true });

      if (error) throw error;
      
      // Remove duplicatas e ordena: Premium primeiro, depois Ouro
      const uniquePartners = data?.reduce((acc, partner) => {
        if (!acc.find(p => p.name === partner.name)) {
          acc.push(partner);
        }
        return acc;
      }, [] as typeof data) || [];
      
      // Ordenar por tier (premium primeiro)
      return uniquePartners.sort((a, b) => {
        if (a.tier === "premium" && b.tier !== "premium") return -1;
        if (a.tier !== "premium" && b.tier === "premium") return 1;
        return 0;
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

### 2. Estado de rotacao automatica:

```typescript
const [currentIndex, setCurrentIndex] = useState(0);

useEffect(() => {
  if (!partners || partners.length <= 1) return;
  
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % partners.length);
  }, 4000); // Rotacao a cada 4 segundos
  
  return () => clearInterval(interval);
}, [partners]);
```

### 3. Exibicao individual com animacao:

```typescript
const currentPartner = partners[currentIndex];

return (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <Crown className="w-5 h-5 text-purple-500" />
      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      <h3 className="text-lg font-semibold text-primary-foreground">
        Parceiros Solidarios
      </h3>
    </div>
    
    {/* Parceiro atual com animacao */}
    <div 
      key={currentPartner.id}
      className="animate-in fade-in duration-500 ..."
    >
      {/* Card do parceiro */}
    </div>
    
    {/* Indicadores de posicao */}
    <div className="flex justify-center gap-1.5 mt-4">
      {partners.map((_, idx) => (
        <button
          key={idx}
          onClick={() => setCurrentIndex(idx)}
          className={`w-2 h-2 rounded-full transition-colors ${
            idx === currentIndex 
              ? "bg-primary-foreground" 
              : "bg-primary-foreground/30"
          }`}
        />
      ))}
    </div>
  </div>
);
```

### 4. Diferenciacao visual por tier:

```typescript
const isPremium = currentPartner.tier === "premium";

// Badge
<Badge className={isPremium 
  ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
}>
  {isPremium ? "Premium" : "Ouro"}
</Badge>

// Borda do avatar
<Avatar className={`border-2 ${
  isPremium ? "border-purple-400/50" : "border-yellow-400/50"
} ...`}>
```

### 5. Acao de clique diferenciada:
- **Premium**: Abre Instagram
- **Ouro**: Abre WhatsApp

## Resumo das Mudancas

| Componente | Acao |
|------------|------|
| `src/components/PremiumPartnerSlots.tsx` | Refatorar completamente para exibicao individual com rotacao |
