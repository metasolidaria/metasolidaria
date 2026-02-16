

## Adicionar campos faltantes nos modais de criar/editar instituicao (Admin)

Os modais de criar e editar instituicao na aba de administracao so tem 3 campos (nome, cidade, telefone), mas a tabela `entities` tem mais 4 campos que precisam estar disponiveis: **doacoes aceitas**, **observacoes**, **chave PIX** e **nome PIX**.

### O que sera feito

**1. Atualizar o hook `useAdminEntities.tsx`**
- Adicionar os campos `accepted_donations`, `observations`, `pix_key` e `pix_name` no tipo `AdminEntity`
- Atualizar as mutations `createEntity` e `updateEntity` para enviar esses campos ao banco

**2. Atualizar `CreateEntityModal.tsx`**
- Adicionar campos para:
  - Doacoes aceitas (checkboxes usando `DONATION_OPTIONS` do `useEntities`)
  - Observacoes (textarea)
  - Chave PIX (input)
  - Nome PIX (input)
- Atualizar a interface `onSubmit` para incluir os novos campos
- Limpar todos os campos ao fechar o modal

**3. Atualizar `EditEntityModal.tsx`**
- Adicionar os mesmos campos do CreateEntityModal
- Carregar os valores existentes da entidade no `useEffect`
- Atualizar a interface `onSubmit` para incluir os novos campos

**4. Atualizar `AdminEntities.tsx`**
- Ajustar os handlers `handleCreate` e `handleEdit` para passar os novos campos

### Detalhes tecnicos

- Os checkboxes de doacoes aceitas usarao o array `DONATION_OPTIONS` importado de `useEntities.tsx`
- O modal tera scroll (`max-h` com `overflow-y-auto`) para acomodar os novos campos
- Nenhuma alteracao de banco de dados necessaria -- os campos ja existem na tabela `entities`
- A interface `AdminEntity` passara a incluir: `accepted_donations: string[] | null`, `observations: string | null`, `pix_key: string | null`, `pix_name: string | null`

