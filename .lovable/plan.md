
# Plano: Incluir Parceiros Nacionais (Brasil) em Todos os Filtros de Cidade

## Problema Identificado
Quando o usuário seleciona uma cidade específica no filtro de parceiros, os parceiros cadastrados com cidade = "Brasil" não aparecem. Isso acontece porque a query atual usa apenas um filtro `ilike` simples que não considera parceiros nacionais.

## Solução Proposta
Modificar o hook `usePaginatedPartners` para usar uma query OR no Supabase que inclua:
1. Parceiros da cidade filtrada
2. Parceiros com cidade = "Brasil" (nacionais)

## Arquivo a Modificar

### src/hooks/usePaginatedPartners.tsx

**Antes:**
```typescript
if (city) {
  const cityName = city.split(",")[0].trim();
  query = query.ilike("city", `%${cityName}%`);
}
```

**Depois:**
```typescript
if (city) {
  const cityName = city.split(",")[0].trim();
  // Incluir parceiros da cidade E parceiros nacionais (Brasil)
  query = query.or(`city.ilike.%${cityName}%,city.ilike.brasil`);
}
```

---

## Detalhes Técnicos

### Mudança na Query
- Usar o método `.or()` do Supabase para combinar duas condições
- Primeira condição: cidade contém o nome buscado
- Segunda condição: cidade é "Brasil" (case-insensitive com ilike)

### Formato do Filtro OR no Supabase
```typescript
query.or(`city.ilike.%${cityName}%,city.ilike.brasil`)
```

Isso gera uma query SQL equivalente a:
```sql
WHERE (city ILIKE '%Campinas%' OR city ILIKE 'brasil')
```

### Benefícios
- Parceiros como "Brave Sports" (cadastrada com cidade "Brasil") aparecerão em qualquer filtro de cidade
- Não afeta o modo de proximidade (que já tem essa lógica)
- Mantém a paginação server-side funcionando corretamente
