
# Plano: Corrigir Problema de Fuso Horário nas Datas de Expiração

## Problema Identificado
Ao selecionar 31/01/2026, o sistema exibe 30/01/2026 devido à interpretação incorreta de timezone.

### Causa Raiz
```
Banco: "2026-01-31" (string ISO)
    ↓
JavaScript: new Date("2026-01-31") → 2026-01-31T00:00:00 UTC
    ↓
Brasil (UTC-3): 30/01/2026 às 21:00 (dia anterior!)
```

## Solução
Criar uma função auxiliar que parse datas ISO como **horário local** em vez de UTC, evitando a conversão de timezone.

## Alterações Necessárias

### 1. Adicionar função auxiliar em `src/lib/utils.ts`

```typescript
/**
 * Parse ISO date string (YYYY-MM-DD) as local date, not UTC
 * This prevents timezone issues where "2026-01-31" becomes "30/01/2026" in BR
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}
```

### 2. Atualizar `src/pages/AdminPartners.tsx`

| Local | Antes | Depois |
|-------|-------|--------|
| Linha 137 | `new Date(expiresAt)` | `parseLocalDate(expiresAt)` |
| Linha 279 | `new Date(partner.expires_at)` | `parseLocalDate(partner.expires_at)` |
| Linha 286 | `new Date(partner.expires_at)` | `parseLocalDate(partner.expires_at)` |

### 3. Atualizar `src/components/EditPartnerModal.tsx`

| Local | Antes | Depois |
|-------|-------|--------|
| Linha 48 | `new Date(partner.expires_at)` | `parseLocalDate(partner.expires_at)` |

### 4. Atualizar `src/components/CreatePartnerModal.tsx`

Nenhuma alteração necessária pois usa Date objects diretamente (não strings).

## Explicação Técnica

```text
ANTES (problema):
┌─────────────────────────────────────────────────────────┐
│ "2026-01-31" → new Date() → 31/01 00:00 UTC            │
│                           → 30/01 21:00 Brasil (UTC-3) │
│                           → Exibe "30/01/2026" ❌       │
└─────────────────────────────────────────────────────────┘

DEPOIS (correção):
┌─────────────────────────────────────────────────────────┐
│ "2026-01-31" → parseLocalDate() → 31/01 00:00 LOCAL    │
│                                 → Exibe "31/01/2026" ✅ │
└─────────────────────────────────────────────────────────┘
```

## Cálculo de Dias Restantes Corrigido

Com a correção, se hoje é 27/01/2026:
- Data expiração: 31/01/2026
- Dias restantes: 31 - 27 = **4 dias** (não mais 2)

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/utils.ts` | Adicionar função `parseLocalDate` |
| `src/pages/AdminPartners.tsx` | Usar `parseLocalDate` em 3 locais |
| `src/components/EditPartnerModal.tsx` | Usar `parseLocalDate` em 1 local |
