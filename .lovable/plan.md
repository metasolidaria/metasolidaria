
# Plano: Adicionar Botão de Informações do Líder na Administração de Grupos

## Objetivo
Adicionar um botão nas ações de cada grupo que, ao clicar, exiba um popover/modal com as informações do líder: nome, telefone (WhatsApp) e email.

---

## Situação Atual

| Dado | Disponível? | Fonte |
|------|-------------|-------|
| Nome do líder | Sim | `groups.leader_name` |
| WhatsApp do líder | Sim | `groups.leader_whatsapp` |
| Email do líder | **Não** | Precisa JOIN com `auth.users` |

---

## Alterações Necessárias

### 1. Banco de Dados
Atualizar a função `get_admin_groups()` e a view `groups_admin` para incluir o email do líder:

```sql
-- Adicionar coluna leader_email via JOIN com auth.users
SELECT 
  g.*,
  u.email as leader_email
FROM groups g
LEFT JOIN auth.users u ON u.id = g.leader_id
```

### 2. TypeScript (Hook)
Atualizar a interface `AdminGroup` em `useAdminGroups.tsx`:

```typescript
export interface AdminGroup {
  // campos existentes...
  leader_email: string | null;  // novo campo
}
```

### 3. Componente de Modal/Popover
Criar um componente `LeaderInfoModal` ou usar um Popover simples para exibir:
- Nome do líder
- WhatsApp (com link para abrir conversa)
- Email (com link mailto)

### 4. Botão na Tabela
Adicionar um botão com ícone de pessoa/coroa na coluna de ações:

```text
[Ver grupo] [Membros] [Add membro] [Convite] [Líder] [Editar] [Excluir]
                                              ^^^^^
                                            (novo)
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Função SQL `get_admin_groups()` | Adicionar JOIN com `auth.users` para buscar email |
| View SQL `groups_admin` | Atualizar para incluir `leader_email` |
| `src/hooks/useAdminGroups.tsx` | Adicionar `leader_email` na interface |
| `src/pages/AdminGroups.tsx` | Adicionar botão e modal/popover com info do líder |

---

## Interface Visual Proposta

Ao clicar no botão, exibir um popover com:

```text
┌─────────────────────────────────┐
│  👤 Informações do Líder        │
├─────────────────────────────────┤
│  Nome: Piero Bueno              │
│  📱 (19) 98251-1944   [Abrir]   │
│  ✉️  piero@email.com  [Enviar]  │
└─────────────────────────────────┘
```

---

## Considerações Técnicas

- A função usa `SECURITY DEFINER` e já verifica `is_admin()`, garantindo que apenas administradores acessem os dados
- O email vem da tabela `auth.users`, que requer acesso via função server-side
- Os links de WhatsApp usarão o formato `https://wa.me/55XXXXXXXXXXX`
- Os links de email usarão `mailto:email@exemplo.com`

---

## Resultado Esperado

Administradores poderão visualizar rapidamente as informações de contato do líder de cada grupo sem precisar acessar outras páginas ou buscar manualmente.
