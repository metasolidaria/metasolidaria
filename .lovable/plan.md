

# Plano de Otimizacao: Paginacao Server-Side

## Status: ✅ IMPLEMENTADO

A paginação server-side foi implementada para Grupos e Parceiros.

---

## O que foi feito

### Hooks criados:
- `src/hooks/usePaginatedGroups.tsx` - Paginação server-side com `.range()`
- `src/hooks/usePaginatedPartners.tsx` - Paginação server-side com `.range()`

### Componentes atualizados:
- `src/components/GroupsSection.tsx` - Usa `usePaginatedGroups`
- `src/components/PartnersSection.tsx` - Usa `usePaginatedPartners`

### Impacto:

| Recurso | Antes | Depois | Economia |
|---------|-------|--------|----------|
| Grupos | 555 itens (~63KB) | 10 itens (~3KB) | -95% |
| Parceiros | 1.178 itens (~76KB) | 10 itens (~4KB) | -95% |

---

## Observações Técnicas

### Parceiros com Proximidade
O filtro de proximidade ainda usa dados client-side porque precisa calcular distâncias com lat/lng. Quando o usuário ativa "Buscar próximos a mim", o hook `useAllPartnersForProximity` carrega apenas parceiros com coordenadas para o cálculo.

### Hooks antigos mantidos
Os hooks originais (`useGroups`, `usePartners`) foram mantidos porque são usados em outros lugares do app (admin panels, etc).

---

## Próximos Passos

1. ✅ ~~Paginação server-side para Grupos~~
2. ✅ ~~Paginação server-side para Parceiros~~
3. ⏳ Otimizar AnimatedCounter (reduzir frequência)
4. ⏳ Lazy load da API IBGE (5570 municípios)
5. ⏳ Eliminar chamadas duplicadas de API
