

## Criar 20 grupos de teste com membros e metas

Inserir dados de teste diretamente no banco de dados com SQL.

### Dados a serem criados

- **20 grupos** em cidades variadas do Brasil (SP, RJ, MG, PR, BA, RS, etc.)
- Tipos de doacao variados: alimentos, livros, roupas, cobertores, brinquedos, higiene, racao
- Metas variadas entre 50 e 500
- Lider: usuario admin existente (094b97b9...)
- **3 membros** por grupo (sem user_id, apenas nomes ficticios) = 60 membros
- **1 meta (commitment)** por membro = 60 commitments

### Cidades planejadas

Sao Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, Salvador, Porto Alegre, Recife, Fortaleza, Brasilia, Goiania, Manaus, Florianopolis, Vitoria, Natal, Joao Pessoa, Maceio, Aracaju, Teresina, Sao Luis, Belem

### Execucao

1. Inserir 20 grupos com o admin como leader_id
2. Inserir 60 membros (3 por grupo), incluindo o lider como primeiro membro
3. Inserir 60 member_commitments (1 por membro)

### Detalhes tecnicos

- Usar UUIDs gerados via `gen_random_uuid()` para os grupos e membros
- O lider sera adicionado como primeiro membro de cada grupo (consistente com o padrao existente)
- Os outros 2 membros serao nomes ficticios sem user_id
- Cada membro tera um commitment com metrica, ratio e donation variados
- Tudo feito via SQL INSERT direto no banco

