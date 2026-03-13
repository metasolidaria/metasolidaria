

## Tornar Instituições Visíveis para Todos (sem login)

### Problema
A view `entities_public` usa `security_invoker=on`, o que significa que herda as políticas RLS da tabela base `entities`. Como a tabela exige `auth.uid() IS NOT NULL` para SELECT, visitantes não logados não conseguem ver nenhuma instituição.

### Solução
Recriar a view `entities_public` com `security_invoker=off` (mesmo padrão usado em `groups_public` e `group_members_public`). Isso permite que qualquer visitante veja as instituições sem precisar estar autenticado.

### Detalhes Técnicos

1. **Migração SQL** -- recriar a view sem security_invoker:
   ```sql
   DROP VIEW IF EXISTS public.entities_public;
   CREATE VIEW public.entities_public AS
     SELECT id, name, city, accepted_donations, observations, 
            pix_key, pix_name, pix_qr_code_url, created_at
     FROM public.entities
     WHERE is_test = false;
   ```
   - Sem `security_invoker=on`, a view executa com permissões do owner (bypassa RLS)
   - Filtra `is_test = false` manualmente na view, mantendo segurança
   - Dados sensíveis (phone, created_by) continuam ocultos

2. **Nenhuma mudança de código necessária** -- o hook `useEntities` já consulta `entities_public` e o componente `EntitiesSection` já está na página inicial.

### Segurança
- Informações sensíveis (telefone, criador) permanecem excluídas da view
- Apenas entidades não-teste são expostas
- Consistente com a estratégia já usada nas outras views públicas do projeto

