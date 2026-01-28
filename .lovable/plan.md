
# Plano: Adicionar Botão para Habilitar/Desabilitar Parceiro

## Objetivo
Permitir que administradores ativem ou desativem parceiros diretamente na tabela, alternando o status `is_approved`. Isso é útil para desabilitar parceiros que expiraram sem precisar excluí-los.

## Comportamento Proposto
- Parceiros **aprovados** terão um botão para **desabilitar** (ícone de toggle off)
- Parceiros **não aprovados** terão um botão para **aprovar** (ícone de check, já existente)
- O status será alterado inline com feedback visual imediato

## Alterações Necessárias

### 1. Adicionar mutation `togglePartnerStatus` em `useAdminPartners.tsx`

Criar uma nova mutation para alternar o status do parceiro de forma mais semântica:

```typescript
const togglePartnerStatus = useMutation({
  mutationFn: async ({ partnerId, isApproved }: { partnerId: string; isApproved: boolean }) => {
    const { error } = await supabase
      .from("partners")
      .update({ is_approved: isApproved })
      .eq("id", partnerId);
    if (error) throw error;
  },
  onSuccess: (_, { isApproved }) => {
    queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
    queryClient.invalidateQueries({ queryKey: ["partners"] });
    toast({
      title: isApproved ? "Parceiro ativado! ✅" : "Parceiro desativado",
      description: isApproved 
        ? "O parceiro agora está visível no guia."
        : "O parceiro não aparecerá mais no guia.",
    });
  },
});
```

### 2. Atualizar tabela em `AdminPartners.tsx`

Substituir a lógica de botões na coluna de ações:

| Estado Atual | Botão Mostrado | Ação |
|--------------|----------------|------|
| `is_approved: true` | Toggle desligar (vermelho) | Define `is_approved: false` |
| `is_approved: false` | Toggle ligar (verde) | Define `is_approved: true` |

**Ícones sugeridos:**
- `ToggleRight` (Lucide) para indicar ativo/habilitar
- `ToggleLeft` para indicar desativar

Ou usar o componente `Switch` do shadcn/ui para uma experiência mais intuitiva.

### 3. Layout da Coluna de Ações (Proposta Final)

```text
┌────────────────────────────────────────────┐
│  [Switch On/Off]  [Editar]  [Excluir]      │
│      ↑                                     │
│  Toggle para ativar/desativar              │
└────────────────────────────────────────────┘
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useAdminPartners.tsx` | Adicionar `togglePartnerStatus` mutation e retorná-la |
| `src/pages/AdminPartners.tsx` | Importar `Switch`, substituir botão de aprovar por toggle interativo |

## Vantagens desta Abordagem

1. **Não destrutivo**: Diferente de excluir, permite reativar o parceiro facilmente
2. **Intuitivo**: Switch é um padrão reconhecido para ativar/desativar
3. **Histórico preservado**: Mantém todos os dados do parceiro para referência futura
4. **Ação rápida**: Um clique para alternar status, sem confirmação necessária
