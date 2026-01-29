

# Script de Seed para Dados de Exemplo

## Resumo
Criar um script SQL de seed que popula o banco de dados com dados de exemplo realistas para a plataforma Meta Solidária, incluindo entidades, grupos, membros, parceiros e registros de progresso.

---

## Dados a Serem Criados

### 1. Entidades (5 registros)
Organizações beneficiárias que receberão as doações:
- Lar dos Idosos Esperança - São Paulo
- Casa da Criança Feliz - Campinas
- Centro Comunitário União - Ribeirão Preto
- Abrigo Vida Nova - Santos
- ONG Mãos que Ajudam - Sorocaba

### 2. Parceiros (10 registros)
Empresas e profissionais que apoiam a causa:
- Supermercado Bom Preço (tier: gold)
- Farmácia Saúde Total (tier: gold)
- Academia Corpo em Forma (tier: silver)
- Restaurante Sabor da Terra (tier: silver)
- Pet Shop Amigo Fiel (tier: bronze)
- Padaria Pão Quente
- Loja de Roupas Elegância
- Clínica Dr. Carlos
- Hamburgueria Artesanal
- Loja de Móveis Casa Nova

### 3. Grupos (5 registros)
Grupos solidários com diferentes tipos de doação:
- Amigos do Bem (alimentos) - São Paulo
- Leitores Solidários (livros) - Campinas
- Aquecendo Corações (cobertores) - Ribeirão Preto
- Moda Solidária (roupas) - Santos
- Brinquedos da Alegria (brinquedos) - Sorocaba

### 4. Membros por Grupo (20 registros total)
4 membros por grupo com metas pessoais e compromissos

### 5. Progresso de Metas (30 registros)
Registros de doações realizadas pelos membros

---

## Detalhes Técnicos

### Dependências e Ordem de Inserção
```text
1. entities (sem dependências)
2. partners (sem dependências)  
3. groups (requer entities para entity_id)
4. group_members (requer groups)
5. goal_progress (requer groups e group_members)
```

### Tratamento de Foreign Keys
- `groups.entity_id` → referencia `entities.id`
- `groups.leader_id` → será um UUID fixo de demonstração (não vinculado a usuário real)
- `group_members.group_id` → referencia `groups.id`
- `goal_progress.group_id` e `goal_progress.member_id` → referências corretas

### Valores Configurados
- Parceiros: diferentes tiers (gold, silver, bronze, null)
- Grupos: diferentes tipos de doação (alimentos, livros, cobertores, roupas, brinquedos)
- Membros: metas pessoais de 50 a 200 unidades
- Progresso: valores de 5 a 50 unidades por registro

---

## Implementação

Será criada uma migração SQL que:

1. **Insere entidades** com cidades do interior paulista
2. **Insere parceiros** com especialidades variadas da lista definida
3. **Insere grupos** vinculados às entidades, com datas de término em 2026
4. **Insere membros** para cada grupo com metas diversificadas
5. **Insere registros de progresso** simulando doações ao longo do tempo

### Resultado Esperado
Após executar o seed:
- ~5 entidades beneficiárias
- ~10 parceiros aprovados (2 gold, 2 silver, 1 bronze, 5 sem tier)
- ~5 grupos ativos com diferentes tipos de doação
- ~20 membros distribuídos nos grupos
- ~30 registros de progresso/doações

Os contadores do Hero (total_groups, total_users, total_goals) serão atualizados automaticamente pelas views existentes.

