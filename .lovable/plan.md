
## Plano: Corrigir Acesso a Grupos Privados na Administração

### Diagnóstico do Problema

O grupo "Meta da semana" é **privado** (`is_private = true`). Após a última migração que adicionou `WHERE is_private = false` na view `groups_public`, o seguinte cenário acontece:

1. **Hook `useGroupDetails`** tenta buscar o grupo diretamente da tabela `groups`
2. A RLS da tabela `groups` exige:
   - `auth.uid() IS NOT NULL` (sessão autenticada)
   - E que o usuário seja: líder, membro, ou que o grupo seja público
3. Se a **sessão estiver inválida/expirada**, a query retorna vazio
4. O fallback para `groups_public` **também falha** porque grupos privados foram excluídos dessa view

**Resultado:** Erro "Grupo não encontrado" mesmo para o próprio líder.

### Solução Proposta

Criar uma **função SECURITY DEFINER** dedicada para administradores visualizarem qualquer grupo. Administradores precisam gerenciar todos os grupos, incluindo privados.

#### Opção 1: Adicionar View Administrativa (Recomendada)

A view `groups_admin` já existe e inclui todos os grupos. O problema está no hook `useGroupDetails` que tenta usar `groups_public` como fallback em vez de `groups_admin`.

**Solução:** Modificar o hook `useGroupDetails` para verificar se o usuário é admin e, nesse caso, usar a view `groups_admin` como fonte de dados.

#### Alterações Necessárias

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useGroupDetails.tsx` | Adicionar verificação de admin e fallback para `groups_admin` |

#### Implementação

```typescript
// Em useGroupDetails.tsx, adicionar lógica:

// 1. Verificar se usuário é admin
const { isAdmin } = useIsAdmin();

// 2. Se for admin e a query principal falhar, buscar de groups_admin
if (!data && isAdmin) {
  const { data: adminData } = await supabase
    .from("groups_admin")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();
  
  if (adminData) return { ...adminData, hasFullAccess: true };
}
```

### Benefícios

- Administradores conseguirão visualizar qualquer grupo (público ou privado)
- Mantém a segurança para usuários normais
- Não requer mudanças no banco de dados
- Usa a infraestrutura de admin já existente

### Impacto

- Administradores terão acesso completo a todos os grupos via interface
- Grupos privados continuam protegidos para usuários não-admin
- A view `groups_public` permanece segura para listagem pública
