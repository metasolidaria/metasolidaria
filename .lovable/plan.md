
## Plano: Corrigir Erro ao Gerar Link de Convite

### Analise do Problema

Apos investigacao detalhada:

1. **Logs do Banco de Dados**: Nao ha erros de banco de dados recentes
2. **Logs de Autenticacao**: A funcionalidade ESTA funcionando na producao (varios convites criados recentemente)
3. **Politicas RLS**: Estao configuradas corretamente - lideres podem criar convites para seus grupos

O erro "Erro ao gerar link" pode ter causas intermitentes:
- Sessao expirada temporariamente
- Problema de rede momentaneo
- Token de autenticacao desatualizado

### Solucao Proposta

#### 1. Melhorar Tratamento de Erros na InviteMemberModal

Adicionar verificacao de sessao antes de tentar criar o convite e mensagens de erro mais especificas:

```typescript
// Em src/components/InviteMemberModal.tsx

const createLinkInvitation = useMutation({
  mutationFn: async (gId: string) => {
    // Verificar sessao antes de prosseguir
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error("Sua sessao expirou. Por favor, faca login novamente.");
    }

    const { data, error } = await supabase
      .from("group_invitations")
      .insert([{ 
        group_id: gId, 
        invited_by: sessionData.session.user.id,
        invite_type: 'link',
        email: null
      }])
      .select('invite_code')
      .single();

    if (error) {
      // Tratar erros especificos
      if (error.code === '42501') {
        throw new Error("Voce nao tem permissao para criar convites neste grupo");
      }
      throw error;
    }
    return data.invite_code;
  },
});
```

#### 2. Adicionar Retry Automatico

Implementar retry automatico em caso de falha temporaria:

```typescript
const createLinkInvitation = useMutation({
  mutationFn: async (gId: string) => {
    // ... codigo existente
  },
  retry: 2,
  retryDelay: 1000,
});
```

#### 3. Adicionar Botao de Retry no Modal

Se o erro persistir, mostrar opcao para tentar novamente sem fechar o modal.

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/InviteMemberModal.tsx` | Melhorar tratamento de erros e verificacao de sessao |

### Detalhes Tecnicos

A mutacao atual usa `supabase.auth.getUser()` que pode falhar silenciosamente se a sessao estiver expirada. Usar `getSession()` primeiro permite detectar problemas de autenticacao antes de tentar a operacao.

Alem disso, adicionar mensagens de erro mais claras ajudara o usuario a entender o que aconteceu e como resolver (ex: fazer login novamente).
