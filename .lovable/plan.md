

## Adicionar Convites na Administração de Grupos

### Objetivo
Incluir botões de ação na página `/admin/grupos` para que administradores possam gerar links de convite e compartilhar via WhatsApp diretamente da tabela de grupos.

---

### Funcionalidades

| Ação | Descrição |
|------|-----------|
| Gerar Link | Cria convite do tipo `link` e copia mensagem formatada para a área de transferência |
| WhatsApp | Cria convite e abre WhatsApp Web com mensagem pré-formatada |

---

### Alterações Necessárias

**1. Página AdminGroups.tsx**
- Importar o componente `InviteMemberModal` já existente
- Adicionar estado para controlar o modal de convite (`inviteModalOpen`)
- Adicionar estado para armazenar o grupo selecionado para convite
- Incluir botão com ícone `Link` na coluna de ações de cada grupo
- Renderizar o modal `InviteMemberModal` passando os dados do grupo

**2. Banco de Dados - Nova Política RLS**
Criar política para permitir que administradores criem convites em nome de qualquer grupo:

```sql
CREATE POLICY "Admins can create invitations for any group"
ON public.group_invitations FOR INSERT
WITH CHECK (is_admin(auth.uid()));
```

---

### Detalhes da Implementação

**Novo botão na tabela (entre UserPlus e Pencil):**
```text
[ExternalLink] [Users] [UserPlus] [Link] [Pencil] [Trash2]
                                   ↑ novo
```

**Props do InviteMemberModal:**
- `open`: boolean para controlar visibilidade
- `onOpenChange`: função para fechar modal
- `groupId`: ID do grupo selecionado
- `groupName`: nome do grupo para personalizar mensagem
- `groupDescription`: descrição para enriquecer o convite

**Fluxo do Usuário:**
1. Admin clica no ícone de link (🔗) na linha do grupo
2. Modal abre com duas opções:
   - "Copiar Link de Convite" → gera convite e copia
   - "Compartilhar via WhatsApp" → gera convite e abre WhatsApp
3. Link gerado: `https://metasolidaria.com.br?invite={code}`
4. Convite válido por 30 dias

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/AdminGroups.tsx` | Adicionar botão de convite e integrar modal |

### Migração de Banco

```sql
-- Permitir admins criarem convites para qualquer grupo
CREATE POLICY "Admins can create invitations for any group"
ON public.group_invitations FOR INSERT
WITH CHECK (is_admin(auth.uid()));
```

---

### Segurança
- A política RLS existente já permite líderes criarem convites para seus grupos
- Nova política permite que administradores criem convites para qualquer grupo
- O modal reutiliza a lógica segura existente de geração de códigos

