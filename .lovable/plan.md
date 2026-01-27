
## Administração de Entidades Beneficiárias

### Objetivo
Criar uma página administrativa em `/admin/entidades` para gerenciamento completo das entidades beneficiárias, permitindo visualizar, adicionar, editar e excluir registros.

---

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Listar entidades | Tabela com todas as entidades (nome, cidade, telefone, data de criação) |
| Busca | Filtro por nome ou cidade |
| Adicionar | Modal para cadastrar nova entidade |
| Editar | Modal para atualizar dados existentes |
| Excluir | Confirmação antes de remover |

---

### Arquivos a Criar

**1. Hook de dados**
`src/hooks/useAdminEntities.tsx`
- Query para buscar todas as entidades (acesso direto à tabela base `entities` para admins)
- Mutations: criar, atualizar e excluir entidades

**2. Página principal**
`src/pages/AdminEntities.tsx`
- Proteção de acesso (apenas admins)
- Tabela com colunas: Nome, Cidade, Telefone, Data, Ações
- Busca por texto
- Botão "Nova Entidade"

**3. Modal de edição**
`src/components/admin/EditEntityModal.tsx`
- Formulário com Nome, Cidade (autocomplete), Telefone
- Pré-populado com dados existentes

**4. Modal de criação**
`src/components/admin/CreateEntityModal.tsx`
- Formulário para nova entidade
- Campos: Nome, Cidade, Telefone (opcional)

---

### Alterações em Arquivos Existentes

**Rotas** - `src/App.tsx`
- Adicionar rota `/admin/entidades`

**Navegação** - `src/components/Footer.tsx`
- Adicionar link "Entidades" no dropdown Admin

---

### Alterações no Banco de Dados

**Política RLS para admins visualizarem**
```sql
CREATE POLICY "Admins can view all entities"
ON public.entities FOR SELECT
USING (is_admin(auth.uid()));
```

**Política RLS para admins atualizarem**
```sql
CREATE POLICY "Admins can update any entity"
ON public.entities FOR UPDATE
USING (is_admin(auth.uid()));
```

**Política RLS para admins excluírem**
```sql
CREATE POLICY "Admins can delete any entity"
ON public.entities FOR DELETE
USING (is_admin(auth.uid()));
```

---

### Detalhes Técnicos

**Estrutura da tabela entities (existente)**
- `id` (uuid) - identificador único
- `name` (text) - nome da entidade
- `city` (text) - cidade
- `phone` (text, opcional) - telefone de contato
- `created_by` (uuid) - usuário que cadastrou
- `created_at` (timestamp) - data de criação

**Interface AdminEntity**
```typescript
interface AdminEntity {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  created_by: string | null;
  created_at: string;
}
```

**Padrões seguidos**
- Mesmo layout das páginas AdminPartners e AdminUsers
- Uso de CityAutocomplete para seleção de cidade
- AlertDialog para confirmação de exclusão
- Toast notifications para feedback

---

### Fluxo de Navegação

```text
Rodapé (Admin Dropdown)
        │
        └── Entidades (/admin/entidades)
                │
                ├── [Listar] Tabela com todas entidades
                ├── [Buscar] Input de pesquisa
                ├── [Nova] → Modal CreateEntityModal
                ├── [Editar] → Modal EditEntityModal
                └── [Excluir] → AlertDialog de confirmação
```

---

### Segurança
- Verificação de admin via `useIsAdmin()` hook
- Redirect para home se não for admin
- Políticas RLS no banco garantem acesso apenas a admins
- Dados sensíveis (telefone) visíveis apenas no painel admin
