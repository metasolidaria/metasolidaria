

## Caixa de Informacoes da Instituicao Beneficente na Pagina do Grupo

### Objetivo

Adicionar uma caixa informativa abaixo dos botoes do lider na pagina do grupo que:

1. **Se o grupo tem uma entidade selecionada**: Mostra os detalhes da entidade (nome, cidade, doacoes aceitas, chave PIX e nome PIX)
2. **Se o grupo NAO tem entidade**: Sugere entidades cadastradas na mesma cidade do grupo, mostrando as mesmas informacoes

### O que sera feito

**1. Atualizar a query do grupo (`src/hooks/useGroupDetails.tsx`)**

- Expandir o select da entidade para incluir `accepted_donations`, `pix_key`, `pix_name` e `observations` alem de `id`, `name` e `city`

**2. Criar componente `EntityInfoBox` (`src/components/EntityInfoBox.tsx`)**

- Novo componente que recebe a cidade do grupo e a entidade selecionada (se houver)
- Se ha entidade selecionada: exibe os dados dela (nome, doacoes aceitas como badges, chave PIX e nome PIX)
- Se nao ha entidade: busca entidades da mesma cidade via `entities_public` e exibe como sugestoes
- Estilo visual: card com icone Building2, cores suaves, consistente com o design existente
- Cada entidade sugerida mostra: nome, lista de doacoes aceitas, e informacoes PIX (se disponiveis)

**3. Integrar na pagina do grupo (`src/pages/GroupPage.tsx`)**

- Inserir o `EntityInfoBox` logo abaixo dos botoes do lider (apos linha 391)
- Visivel para todos os visitantes da pagina, nao apenas lideres
- Passa `groupCity={group.city}`, `entity={group.entity}`, e `entityId={group.entity_id}`

### Detalhes tecnicos

- A busca de sugestoes usara a view `entities_public` filtrando por cidade (case-insensitive com `ilike`)
- O componente usara `useQuery` do TanStack para buscar as sugestoes apenas quando nao ha entidade selecionada
- Labels das doacoes aceitas serao mapeadas usando o array `DONATION_OPTIONS` ja existente em `useEntities.tsx`
- Informacoes PIX serao exibidas com icone de copia para facilitar o uso
- Se nao houver entidades na cidade, a caixa nao sera exibida

