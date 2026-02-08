
## Plano: Adicionar 2 Membros por Grupo de Teste

### Objetivo
Adicionar 2 novos membros em cada um dos 5 grupos de teste (seed), aumentando de 5 para 7 membros por grupo.

### Grupos de Teste Identificados
| Grupo | Cidade | Membros Atuais |
|-------|--------|----------------|
| Amigos do Bem | São Paulo | 5 |
| Leitores Solidários | Campinas | 5 |
| Aquecendo Corações | Ribeirão Preto | 5 |
| Moda Solidária | Santos | 5 |
| Brinquedos da Alegria | Sorocaba | 5 |

### Implementação

Executar INSERT para adicionar 10 novos membros (2 por grupo) com:
- Nomes fictícios realistas
- Metas pessoais variadas
- WhatsApp formatado
- Contagem de metas alcançadas

```sql
INSERT INTO group_members (group_id, name, whatsapp, personal_goal, goals_reached)
VALUES
  -- Amigos do Bem (São Paulo)
  ('11111111-1111-1111-1111-111111111111', 'Ricardo Mendes', '(11) 98765-1234', 15, 3),
  ('11111111-1111-1111-1111-111111111111', 'Tatiana Oliveira', '(11) 97654-3210', 12, 5),
  
  -- Leitores Solidários (Campinas)
  ('22222222-2222-2222-2222-222222222222', 'Gustavo Ferreira', '(19) 99876-5432', 20, 8),
  ('22222222-2222-2222-2222-222222222222', 'Camila Rodrigues', '(19) 98765-4321', 18, 6),
  
  -- Aquecendo Corações (Ribeirão Preto)
  ('33333333-3333-3333-3333-333333333333', 'Fernando Almeida', '(16) 99654-3210', 10, 4),
  ('33333333-3333-3333-3333-333333333333', 'Letícia Souza', '(16) 98543-2109', 8, 2),
  
  -- Moda Solidária (Santos)
  ('44444444-4444-4444-4444-444444444444', 'Bruno Carvalho', '(13) 99432-1098', 25, 10),
  ('44444444-4444-4444-4444-444444444444', 'Isabela Martins', '(13) 98321-0987', 22, 9),
  
  -- Brinquedos da Alegria (Sorocaba)
  ('55555555-5555-5555-5555-555555555555', 'Eduardo Santos', '(15) 99210-9876', 14, 5),
  ('55555555-5555-5555-5555-555555555555', 'Natália Costa', '(15) 98109-8765', 16, 7);
```

### Resultado Esperado
Cada grupo de teste passará de 5 para 7 membros, totalizando 35 membros nos grupos de seed.
