

# Plano: Corrigir o Bug de Entrada em Grupos Públicos

## Diagnóstico do Problema

Ao clicar em "Participar" num grupo público, o usuário é redirecionado para a página do grupo, mas não aparece como membro. A análise revelou:

### Fluxo Atual (Problemático)
1. Usuário clica "Participar" em grupo público
2. `joinGroup.mutate()` insere o membro no banco (funciona corretamente)
3. `apply_default_commitment` aplica meta padrão (funciona)
4. `onSuccess` invalida apenas: `paginatedGroups`, `userMemberships`, `impactStats`
5. Navegação para `/grupo/{id}` acontece
6. `useGroupDetails` usa query `["groupMembers", groupId]` **que NÃO foi invalidado**
7. Dados em cache retornam sem o novo membro

### Causa Raiz
O cache `["groupMembers", groupId]` não é invalidado após a entrada bem-sucedida no grupo, resultando em dados desatualizados na página de destino.

---

## Solução Proposta

### 1. Adicionar Invalidação do Cache de Membros

Modificar o `onSuccess` do `joinGroup.mutate()` em **dois arquivos**:

**Arquivo: `src/hooks/usePaginatedGroups.tsx`**
- Adicionar invalidação de `["groupMembers"]` no callback de sucesso
- Também invalidar `["group"]` para garantir dados frescos

**Arquivo: `src/hooks/useGroups.tsx`**  
- Aplicar a mesma correção no hook legado

### 2. Aguardar Invalidação Antes de Navegar

Modificar o callback em `src/components/GroupsSection.tsx`:
- Usar `mutateAsync` ao invés de `mutate` com callback
- Ou passar o `groupId` no `onSuccess` para invalidar especificamente

---

## Detalhes Técnicos

### Mudança em `src/hooks/usePaginatedGroups.tsx` (linhas 159-166)

```typescript
// ANTES:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["paginatedGroups"] });
  queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
  queryClient.invalidateQueries({ queryKey: ["impactStats"] });
  toast({...});
}

// DEPOIS:
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ["paginatedGroups"] });
  queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
  queryClient.invalidateQueries({ queryKey: ["impactStats"] });
  // NOVO: Invalidar cache de membros do grupo específico
  queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
  queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
  toast({...});
}
```

### Mudança similar em `src/hooks/useGroups.tsx` (linhas 201-208)

Adicionar as mesmas invalidações de `groupMembers` e `group`.

---

## Benefícios da Solução

1. Quando o usuário navegar para a página do grupo, o cache será invalidado
2. O `useGroupDetails` fará uma nova requisição e receberá dados atualizados
3. O novo membro aparecerá corretamente na lista

## Risco

Nenhum risco identificado - apenas adiciona invalidações de cache adicionais que são necessárias para manter a consistência dos dados.

