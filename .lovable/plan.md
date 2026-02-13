

## Criar 32 Grupos de Teste em Campinas

### O que sera feito

Inserir dados de teste no banco de dados:

1. **32 novos grupos** na cidade de Campinas, todos privados, com tipos de doacao variados (alimentos, livros, roupas, cobertores, sopas, brinquedos, higiene, racao)
2. **64 voluntarios** (2 por grupo) -- membros sem user_id vinculado, apenas com nome ficticio
3. **Sem metas individuais** (member_commitments) conforme solicitado

### Detalhes tecnicos

**Passo 1 -- Inserir 32 grupos na tabela `groups`**
- Cidade: "Campinas - SP"
- `is_private`: true
- `leader_id`: ID do admin (Piero Bueno)
- `leader_name`: "Piero Bueno"
- `goal_2026`: valores variados (50-500)
- Nomes variados como "Solidarios Campinas 1", "Amigos do Bem Campinas", etc.
- Tipos de doacao distribuidos entre as 8 opcoes disponiveis

**Passo 2 -- Inserir 64 membros na tabela `group_members`**
- 2 voluntarios por grupo, sem `user_id`
- Nomes ficticios brasileiros variados
- `personal_goal`: 0

**Passo 3 -- Corrigir erros de build**
- Adicionar declaracao de tipo para `pushManager` no `ServiceWorkerRegistration` para resolver os 3 erros TypeScript em `usePushNotifications.tsx`

