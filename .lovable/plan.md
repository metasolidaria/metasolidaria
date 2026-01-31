
# Plano: Corrigir Problema de "Meus Grupos" Não Aparecendo

## Diagnóstico

Após análise detalhada dos logs de rede e do código, identifiquei uma **race condition** entre dois estados:

1. Quando o usuário loga, o `useEffect` na linha 60-64 muda automaticamente o filtro para "mine"
2. Porém, a query `useUserMemberships` pode ainda não ter completado
3. Isso faz com que `userMemberships.length === 0` seja verdadeiro temporariamente
4. A lógica na linha 70-72 do hook retorna array vazio quando `filter === "mine"` e memberships está vazio

A API está funcionando corretamente - o grupo "Gerando futuro" aparece na resposta de `groups_public`. O problema é puramente de timing no frontend.

## Solução

Modificar a lógica do hook `usePaginatedGroups` para lidar melhor com o estado de carregamento inicial dos memberships, além de usar `leader_id` como fallback para identificar grupos do usuário.

### 1. Corrigir Hook `usePaginatedGroups`

**Arquivo**: `src/hooks/usePaginatedGroups.tsx`

Alterações:
- Adicionar verificação do estado de loading do `useUserMemberships`
- Incluir grupos onde o usuário é líder no filtro "mine" (mesmo se não estiver na tabela `group_members`)
- Melhorar a queryKey para incluir o estado de loading

```typescript
// Hook to get user memberships - agora com status de loading
export const useUserMemberships = () => {
  const { data: userMemberships, isLoading } = useQuery({
    queryKey: ["userMemberships"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data?.map(m => m.group_id) || [];
    },
  });

  return { userMemberships: userMemberships || [], isLoading };
};
```

### 2. Atualizar `usePaginatedGroups`

Modificar para:
- Aguardar o carregamento de memberships antes de renderizar "lista vazia"
- No filtro "mine", buscar todos os grupos e filtrar localmente por `leader_id` ou membership

```typescript
// Na query, para o filtro "mine", em vez de passar IDs,
// buscar grupos onde leader_id = user.id OU id IN userMemberships
if (filter === "mine") {
  // Se ainda está carregando memberships, aguardar
  if (membershipsLoading) return { groups: [], count: 0, isLoadingMemberships: true };
  
  // Buscar grupos do usuário (líder OU membro)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { groups: [], count: 0 };
  
  // Construir query para incluir grupos onde é líder ou membro
  let query = supabase
    .from("groups_public")
    .select("*", { count: "exact" });
  
  if (userMemberships.length > 0) {
    // Líder OU membro
    query = query.or(`leader_id.eq.${user.id},id.in.(${userMemberships.join(',')})`);
  } else {
    // Apenas líder
    query = query.eq("leader_id", user.id);
  }
  
  // ...resto da query
}
```

### 3. Atualizar `GroupsSection`

**Arquivo**: `src/components/GroupsSection.tsx`

Modificar para:
- Receber o estado de loading de memberships
- Mostrar loading enquanto memberships estiver carregando
- Não mudar automaticamente para "mine" até que memberships esteja carregado

```typescript
const { userMemberships, isLoading: membershipsLoading } = useUserMemberships();

// Não mudar para "mine" automaticamente até memberships carregar
useEffect(() => {
  if (user && !membershipsLoading) {
    setFilter("mine");
  }
}, [user, membershipsLoading]);
```

## Arquivos Alterados

1. `src/hooks/usePaginatedGroups.tsx` - Ajustar hooks para lidar com loading state
2. `src/components/GroupsSection.tsx` - Aguardar carregamento de memberships

## Resultado Esperado

- Não haverá mais flash de "Você ainda não faz parte de nenhum grupo" ao logar
- O card do grupo "Gerando futuro" aparecerá corretamente
- Grupos onde o usuário é líder sempre aparecerão em "Meus Grupos"
- A experiência será mais fluida, sem estados intermediários incorretos
