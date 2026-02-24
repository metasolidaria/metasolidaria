

# Forçar rebuild para restaurar o .env

## O que será feito

Uma alteração mínima e inofensiva no código (adicionar um comentário no `src/main.tsx`) para forçar um novo build. O sistema Lovable Cloud regenera automaticamente o arquivo `.env` com as variáveis necessárias durante cada build.

## Detalhes técnicos

- Adicionar um comentário no arquivo `src/main.tsx` (ex: `// rebuild trigger`)
- Isso forçará um novo build, que automaticamente recria o `.env` com:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
- O erro `supabaseUrl is required` será resolvido pois o cliente Supabase voltará a receber as variáveis de ambiente

## Risco

Nenhum. A alteração é apenas um comentário que não afeta funcionalidade.

