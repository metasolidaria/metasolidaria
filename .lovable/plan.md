

# Plano: Popular Tabela de Progresso para o Doadômetro

## Diagnóstico
O doadômetro (ImpactCounter) está zerado porque a view `impact_stats_public` consulta a tabela `goal_progress`, que está **vazia**. 

A distinção é:
- **`member_commitments`**: Metas e compromissos planejados (já populados com 1.540 unidades)
- **`goal_progress`**: Doações efetivamente registradas (está vazia)

O doadômetro exibe o **impacto real** (doações feitas), não as metas futuras.

## Solução
Inserir registros de progresso de doações na tabela `goal_progress` para simular doações já realizadas pelos membros.

## Implementação

### Passo 1: Inserir registros de progresso
Criar entradas de doações em `goal_progress` vinculadas aos membros existentes, distribuindo quantidades realistas por categoria:

| Categoria    | Quantidade | Membros envolvidos |
|--------------|------------|-------------------|
| Alimentos    | ~400 kg    | 4 membros         |
| Livros       | ~150 un    | 4 membros         |
| Cobertores   | ~100 un    | 4 membros         |
| Roupas       | ~200 peças | 4 membros         |
| Brinquedos   | ~80 un     | 4 membros         |

**Total esperado**: ~930 doações registradas

### Detalhes Técnicos

A tabela `goal_progress` tem a seguinte estrutura:
- `group_id`: UUID do grupo (já temos 5 grupos)
- `member_id`: UUID do membro (já temos 20 membros)
- `user_id`: UUID do usuário (usaremos o líder admin: `094b97b9-3b1b-4b0e-9e5f-d42b1953c704`)
- `amount`: Quantidade doada
- `description`: Descrição opcional

### SQL de Seed

```sql
INSERT INTO goal_progress (group_id, member_id, user_id, amount, description) VALUES
-- Grupo Alimentos (11111111...)
('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '094b97b9...', 120, 'Campanha de arrecadação'),
('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111112', '094b97b9...', 80, 'Doação da feira'),
-- ... mais registros para cada categoria
```

## Resultado Esperado
Após a execução:
- O doadômetro exibirá ~930 doações totais
- Cada categoria (alimentos, livros, etc.) mostrará seus respectivos totais
- A animação de contagem funcionará normalmente

