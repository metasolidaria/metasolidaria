
# Plano: Controle de Visibilidade de Membros

## Resumo
Adicionar uma opção para líderes definirem se a lista de membros do grupo é visível para outros membros. Quando desativada, os indicadores de meta e progresso (totais) continuam visíveis, mas a lista detalhada de membros é ocultada.

## Mudanças Necessárias

### 1. Banco de Dados
Adicionar nova coluna `members_visible` na tabela `groups`:

```sql
ALTER TABLE public.groups 
ADD COLUMN members_visible boolean NOT NULL DEFAULT true;

-- Atualizar views que expõem dados de grupos
-- A coluna será acessível apenas para usuários autenticados via políticas existentes
```

### 2. Arquivos de Frontend a Modificar

#### `src/components/CreateGroupModal.tsx`
- Adicionar estado `membersVisible` no `formData` (padrão: `true`)
- Adicionar switch com ícone e descrição explicativa
- Passar o novo campo na criação do grupo

#### `src/components/EditGroupModal.tsx`
- Adicionar estado `membersVisible` no `formData`
- Carregar valor existente do grupo no `useEffect`
- Adicionar switch para alternar visibilidade
- Passar o campo na atualização

#### `src/components/admin/CreateGroupAdminModal.tsx`
- Adicionar campo `membersVisible` no formulário
- Passar na chamada RPC `create_group_with_leader`

#### `src/components/admin/EditGroupAdminModal.tsx`
- Adicionar campo `membersVisible` no formulário
- Incluir na interface e no `onSave`

#### `src/pages/GroupPage.tsx` (linhas ~516-640)
- Verificar `group.members_visible` antes de renderizar a seção de membros
- Se `members_visible === false`:
  - Ocultar lista detalhada de membros
  - Mostrar apenas contagem de membros e progresso agregado
  - Mostrar mensagem explicativa "Lista de membros oculta pelo líder"
- Líderes sempre veem a lista completa (para gerenciamento)

#### `src/hooks/useGroupDetails.tsx`
- Atualizar `updateGroup` para aceitar `members_visible`

#### `src/hooks/useAdminGroups.tsx`
- Adicionar `members_visible` ao tipo `AdminGroup`
- Incluir no mutation `updateGroup`

### 3. Interface Visual

```text
┌─────────────────────────────────────────┐
│ 👥 Visibilidade dos Membros             │
│                                         │
│ Membros Visíveis                 [ON]   │
│ Outros membros podem ver a lista        │
│ de participantes do grupo               │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Membros Ocultos                  [OFF]  │
│ Apenas você (líder) pode ver a          │
│ lista de membros. Os totais de meta     │
│ e doações continuam visíveis.           │
└─────────────────────────────────────────┘
```

### 4. Lógica de Exibição na Página do Grupo

```
SE group.members_visible === true OU usuário é líder:
  → Mostrar lista completa de membros com avatar, nome, metas, botões
SENÃO:
  → Mostrar card simplificado:
    "👥 Membros: X participantes"
    "📊 Meta do grupo: X / Y (soma de todos)"
    "ℹ️ A lista de membros está oculta pelo líder"
```

### 5. Função RPC `create_group_with_leader`
Atualizar para aceitar parâmetro `_members_visible`:

```sql
CREATE OR REPLACE FUNCTION public.create_group_with_leader(
  _name text,
  _city text,
  _donation_type text,
  _goal_2026 integer,
  _is_private boolean,
  _leader_name text,
  _leader_whatsapp text,
  _description text,
  _end_date date DEFAULT '2026-12-31'::date,
  _entity_id uuid DEFAULT NULL,
  _members_visible boolean DEFAULT true  -- Novo parâmetro
)
```

## Fluxo Resumido

1. **Líder cria grupo** → Define `membersVisible: true/false`
2. **Líder edita grupo** → Pode alternar a qualquer momento
3. **Membro acessa grupo**:
   - Se visível: vê lista completa de membros
   - Se oculto: vê apenas totais agregados
4. **Líder sempre vê tudo** (para poder gerenciar)

## Considerações de Segurança
- A coluna segue as políticas RLS existentes da tabela `groups`
- Apenas usuários autenticados com acesso ao grupo podem ver o campo
- Líderes mantêm controle total sobre a visibilidade
