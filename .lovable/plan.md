

# Plano de Otimizacao: Paginacao Server-Side

## Diagnostico Confirmado

A volumetria de dados **e sim um problema** significativo para performance mobile:

| Recurso | Carregado | Exibido | Desperdicio |
|---------|-----------|---------|-------------|
| Grupos | 555 | 10 | 98% |
| Parceiros | 1.178 | 10 | 99% |

**Impacto estimado:** ~140KB de JSON desnecessario no load inicial, causando 2-4s de atraso em conexoes moveis lentas.

---

## Problema Atual

A paginacao atual e **client-side**:

```tsx
// useGroups.tsx - Carrega TODOS os grupos
const { data: groupsData } = await supabase
  .from("groups_public")
  .select("*")
  .order("created_at", { ascending: false }); // Sem .limit() ou .range()

// GroupsSection.tsx - Pagina no cliente
const paginatedGroups = filteredGroups?.slice(startIndex, startIndex + ITEMS_PER_PAGE);
```

Isso significa que o browser:
1. Baixa 555 grupos (63KB)
2. Parse o JSON inteiro
3. Mostra apenas 10

---

## Solucao Proposta

### Fase 1: Paginacao Server-Side para Grupos

**useGroups.tsx:**
- Adicionar parametros `page` e `limit`
- Usar `.range(from, to)` do Supabase
- Retornar `count` para calcular total de paginas

```tsx
// Antes
.select("*")
.order("created_at", { ascending: false })

// Depois
.select("*", { count: "exact", head: false })
.order("created_at", { ascending: false })
.range((page - 1) * limit, page * limit - 1)
```

**GroupsSection.tsx:**
- Passar `page` e `limit` para o hook
- Remover slice client-side
- Usar `count` retornado para paginacao

### Fase 2: Paginacao Server-Side para Parceiros

**usePartners.tsx:**
- Mesma abordagem de `.range()`
- Considerar filtros de categoria/cidade no servidor

**PartnersSection.tsx:**
- Adaptar para paginacao server-side
- Manter filtros de proximidade no cliente (requer lat/lng)

### Fase 3: Manter Busca/Filtros no Cliente

Para manter a experiencia de busca responsiva:
- Criar um hook separado `useGroupsSearch` que carrega apenas para busca
- A busca pode usar a view `groups_search` que tem menos campos

---

## Arquivos a Modificar

### Prioridade Alta:
1. `src/hooks/useGroups.tsx` - Adicionar paginacao server-side
2. `src/components/GroupsSection.tsx` - Usar nova paginacao
3. `src/hooks/usePartners.tsx` - Adicionar paginacao server-side
4. `src/components/PartnersSection.tsx` - Usar nova paginacao

### Prioridade Media:
5. `src/components/GroupSearch.tsx` - Manter busca separada

---

## Impacto Esperado

| Metrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| JSON Grupos | 63 KB | ~3 KB | -95% |
| JSON Parceiros | 76 KB | ~4 KB | -95% |
| FCP Mobile | ~4s | ~2s | -50% |
| Performance Score | 62% | 75%+ | +13% |

---

## Consideracoes Tecnicas

### Trade-offs da Paginacao Server-Side

**Vantagens:**
- Reducao drastica do payload inicial
- Menos parse de JSON no cliente
- Menor uso de memoria

**Desvantagens:**
- Latencia adicional ao mudar de pagina
- Filtros de cidade/categoria precisam ir para o servidor
- Complexidade adicional no codigo

### Alternativa: Lazy Loading por Secao

Se a paginacao server-side for muito complexa, uma alternativa e:
- Carregar apenas quando a secao ficar visivel (`IntersectionObserver`)
- Manter paginacao client-side mas adiar o fetch

Esta alternativa e mais simples mas menos eficiente.

---

## Proximos Passos

Apos a paginacao server-side, as proximas otimizacoes seriam:
1. Otimizar `AnimatedCounter` (reduzir frequencia de atualizacao)
2. Lazy load da API IBGE (5570 municipios)
3. Eliminar chamadas duplicadas de API

