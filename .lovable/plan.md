
## Integrar GitHub Sponsors - metasolidaria

### Resumo

Criar uma integracao com o GitHub Sponsors para buscar e exibir os patrocinadores do projeto **metasolidaria** no site. Os sponsors serao exibidos em uma secao dedicada no Footer ou proxima a ele.

### Como funciona

1. Uma funcao backend busca os sponsors do GitHub usando a API GraphQL do GitHub
2. Os dados sao cacheados no banco de dados para evitar chamadas excessivas a API
3. O frontend exibe os sponsors com avatar e nome, linkando para o perfil do GitHub

### Etapas

#### 1. Configurar o token do GitHub

- Sera necessario um **GitHub Personal Access Token (PAT)** com permissao `read:org` e `read:user` para acessar a API GraphQL e listar sponsors
- O token sera armazenado como secret seguro no backend

#### 2. Criar tabela para cache dos sponsors

Criar uma tabela `github_sponsors` para cachear os dados e evitar chamadas excessivas a API:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| github_login | text | Username do sponsor |
| github_name | text | Nome de exibicao |
| avatar_url | text | URL do avatar |
| profile_url | text | URL do perfil GitHub |
| tier_name | text | Nome do tier (ex: Bronze, Prata) |
| tier_monthly_price | integer | Valor mensal em centavos |
| is_active | boolean | Se o sponsor esta ativo |
| fetched_at | timestamptz | Quando foi buscado |

A tabela sera publica (sem RLS restritivo) pois os dados de sponsors sao publicos.

#### 3. Criar funcao backend `fetch-github-sponsors`

Uma edge function que:
- Chama a API GraphQL do GitHub em `https://api.github.com/graphql`
- Busca os sponsors de `metasolidaria`
- Atualiza a tabela `github_sponsors` com os dados mais recentes
- Pode ser chamada periodicamente ou sob demanda

#### 4. Criar componente `GitHubSponsors`

Um componente React que:
- Busca os sponsors da tabela `github_sponsors`
- Exibe avatares em grid/carrossel com nome e link
- Mostra um botao "Seja um Sponsor" linkando para `https://github.com/sponsors/metasolidaria`

#### 5. Adicionar ao Footer

Inserir o componente de sponsors no Footer, acima dos links legais, com titulo "Nossos Sponsors" e o icone do GitHub.

### Detalhes tecnicos

**Arquivos novos:**
- `supabase/functions/fetch-github-sponsors/index.ts` - Edge function para buscar sponsors via GraphQL
- `src/components/GitHubSponsorsSection.tsx` - Componente de exibicao
- `src/hooks/useGitHubSponsors.tsx` - Hook para buscar dados do banco

**Arquivos modificados:**
- `src/components/Footer.tsx` - Adicionar secao de sponsors
- `supabase/config.toml` - Registrar a nova edge function

**Secret necessario:**
- `GITHUB_PAT` - Personal Access Token do GitHub com permissoes de leitura

**Query GraphQL usada:**
```text
query {
  user(login: "metasolidaria") {
    sponsorshipsAsMaintainer(first: 100, activeOnly: true) {
      nodes {
        sponsorEntity {
          ... on User {
            login
            name
            avatarUrl
            url
          }
          ... on Organization {
            login
            name
            avatarUrl
            url
          }
        }
        tier {
          name
          monthlyPriceInCents
        }
      }
    }
  }
}
```

**Migracao SQL:**
- Criar tabela `github_sponsors`
- Politica RLS: SELECT publico para todos, INSERT/UPDATE/DELETE apenas via service role

### Resultado esperado

No rodape do site, aparecera uma secao com os avatares dos sponsors do GitHub, organizados por tier, com um botao para novos sponsors se inscreverem via `github.com/sponsors/metasolidaria`.
