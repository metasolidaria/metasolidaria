

## Adicionar "Ração" na lista de tipos de doação do formulário de criação de grupo

### Problema
No componente `CreateGroupModal.tsx` (formulário que o usuário usa para criar grupo), a opção "Ração (kg)" não está na lista de tipos de doação. Ela existe no painel admin (`CreateGroupAdminModal.tsx`), mas foi esquecida no formulário principal.

### Solução
Adicionar a opção `{ id: "racao", label: "Ração (kg)", icon: "🐾" }` na lista `donationTypes` do arquivo `src/components/CreateGroupModal.tsx`, antes da opção "Outro".

### Alterações

**Arquivo: `src/components/CreateGroupModal.tsx`**
- Adicionar na linha 37 (após "Mudas de Árvore" e antes de "Doador de Sangue"):
  - `{ id: "racao", label: "Ração (kg)", icon: "🐾" }`

Nenhuma outra alteração necessária -- o banco de dados já aceita qualquer valor no campo `donation_type`.

