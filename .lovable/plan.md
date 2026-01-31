
# Plano: Meta Padrão para Novos Membros

## Objetivo
Permitir que o líder defina uma meta padrão ao criar o grupo. Quando um novo membro entrar, ele automaticamente receberá essa meta como um "commitment block" inicial, podendo alterá-la posteriormente.

## Exemplo do Usuário
> "O líder parametrizar que cada 1 corrida que finalizar vai doar 1 kg de alimento. Depois o membro se quiser pode alterar."

---

## Visão Geral da Implementação

### 1. Adicionar Campos de Meta Padrão na Tabela `groups`

Novos campos na tabela `groups`:
- `default_commitment_name` (text, nullable) - Nome da meta padrão (ex: "Meta de Corridas")
- `default_commitment_metric` (text, nullable) - Métrica (ex: "corrida")
- `default_commitment_ratio` (integer, default 1) - Proporção (ex: 1)
- `default_commitment_donation` (integer, default 1) - Quantidade de doação (ex: 1 kg)
- `default_commitment_goal` (integer, default 0) - Meta inicial sugerida (ex: 10)

### 2. Atualizar o Modal de Criação de Grupo

**Arquivos:** `src/components/CreateGroupModal.tsx`, `src/components/admin/CreateGroupAdminModal.tsx`

Adicionar seção "Meta Padrão para Membros" com campos:
- Nome da meta (opcional)
- Regra: "A cada X [métrica] = Y [unidade de doação]"
- Meta inicial sugerida (quantidade de unidades)

O líder verá um preview como:
> "A cada 1 corrida = 1 kg de alimento | Meta sugerida: 10 kg"

### 3. Atualizar Função `create_group_with_leader`

Adicionar parâmetros para os campos de meta padrão.

### 4. Criar Função para Aplicar Meta Padrão a Novo Membro

Nova função no banco: `apply_default_commitment(_member_id uuid, _group_id uuid)`

Esta função:
1. Busca os dados de meta padrão do grupo
2. Se existir uma métrica padrão definida, cria um registro em `member_commitments` para o novo membro

### 5. Modificar Pontos de Entrada de Membros

**Locais onde membros são adicionados:**
1. `accept_link_invitation` - Convite por link
2. `accept_group_invitation` - Convite por email
3. `joinGroup` (useGroups) - Entrada direta em grupo público
4. `addMember` (AddMemberModal) - Líder adicionando membro manualmente
5. `create_group_with_leader` - O próprio líder ao criar

Cada um desses pontos chamará `apply_default_commitment` após inserir o membro.

### 6. Permitir Edição da Meta Padrão no Modal de Edição do Grupo

**Arquivo:** `src/components/EditGroupModal.tsx`

Adicionar a mesma seção de "Meta Padrão" para que o líder possa alterar posteriormente.

---

## Detalhes Técnicos

### Migração SQL

```sql
-- Adicionar campos de meta padrão na tabela groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_name text;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_metric text;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_ratio integer DEFAULT 1;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_donation integer DEFAULT 1;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_goal integer DEFAULT 0;

-- Função para aplicar meta padrão ao membro
CREATE OR REPLACE FUNCTION apply_default_commitment(_member_id uuid, _group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _group record;
BEGIN
  -- Buscar configuração de meta padrão do grupo
  SELECT 
    default_commitment_name,
    default_commitment_metric,
    default_commitment_ratio,
    default_commitment_donation,
    default_commitment_goal
  INTO _group
  FROM groups
  WHERE id = _group_id;

  -- Se tem métrica definida, criar commitment
  IF _group.default_commitment_metric IS NOT NULL 
     AND _group.default_commitment_metric != '' THEN
    INSERT INTO member_commitments (
      member_id,
      name,
      metric,
      ratio,
      donation_amount,
      personal_goal
    ) VALUES (
      _member_id,
      COALESCE(_group.default_commitment_name, 'Meta de ' || _group.default_commitment_metric),
      _group.default_commitment_metric,
      COALESCE(_group.default_commitment_ratio, 1),
      COALESCE(_group.default_commitment_donation, 1),
      COALESCE(_group.default_commitment_goal, 0)
    );
  END IF;
END;
$$;
```

### Atualizar Funções de Entrada de Membros

As funções `accept_link_invitation`, `accept_group_invitation` e `create_group_with_leader` serão atualizadas para chamar `apply_default_commitment` após inserir o membro.

### UI do Modal de Criação

Nova seção no formulário:

```
┌─────────────────────────────────────────────┐
│ 🎯 Meta Padrão para Membros (opcional)      │
│                                             │
│ Regra de Doação:                            │
│ A cada [1] [corrida] = [1] kg              │
│                                             │
│ Meta inicial sugerida: [10] kg              │
│                                             │
│ 📌 Preview: "1 corrida = 1 kg"              │
│    Membros entrarão com meta de 10 kg       │
└─────────────────────────────────────────────┘
```

---

## Fluxo do Usuário

1. **Líder cria grupo** → Define "1 corrida = 1 kg, meta 10 kg"
2. **Novo membro entra** → Automaticamente recebe commitment com:
   - Métrica: "corrida"
   - Regra: 1 corrida = 1 kg
   - Meta: 10 kg
3. **Membro acessa grupo** → Vê sua meta pré-configurada
4. **Membro pode editar** → Altera valores conforme preferência

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/migrations/` | Nova migração com campos e funções |
| `src/components/CreateGroupModal.tsx` | Adicionar seção de meta padrão |
| `src/components/admin/CreateGroupAdminModal.tsx` | Adicionar seção de meta padrão |
| `src/components/EditGroupModal.tsx` | Adicionar edição de meta padrão |
| `src/hooks/useGroups.tsx` | Passar parâmetros de meta padrão na criação |
| `src/hooks/usePaginatedGroups.tsx` | Atualizar joinGroup para chamar apply_default_commitment |
| `src/components/AddMemberModal.tsx` | Chamar apply_default_commitment após adicionar |

---

## Considerações

- **Retrocompatibilidade**: Grupos existentes não terão meta padrão (campos nullable)
- **Membros existentes**: Não são afetados, apenas novos membros
- **Líder como membro**: Ao criar o grupo, o líder também recebe a meta padrão
- **Segurança**: Função `apply_default_commitment` é SECURITY DEFINER para permitir inserção em `member_commitments`
