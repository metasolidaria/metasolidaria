

# Plano: Corrigir Constraint de Tier no Banco de Dados

## Problema Identificado
O frontend foi atualizado para usar "premium" em vez de "diamante", mas o banco de dados ainda tem uma constraint que valida apenas os valores antigos.

**Erro no banco:**
```
new row for relation "partners" violates check constraint "partners_tier_check"
```

**Constraint atual:**
```sql
CHECK (tier = ANY (ARRAY['diamante', 'ouro', 'apoiador']))
```

## Solução
Atualizar a constraint do banco de dados para aceitar o novo valor "premium".

## Alterações Necessárias

### 1. Migration para atualizar a constraint

```sql
-- Remover constraint antiga
ALTER TABLE public.partners DROP CONSTRAINT partners_tier_check;

-- Adicionar nova constraint com "premium" no lugar de "diamante"
ALTER TABLE public.partners 
ADD CONSTRAINT partners_tier_check 
CHECK (tier = ANY (ARRAY['premium', 'ouro', 'apoiador']));

-- Atualizar registros existentes que usam "diamante" para "premium"
UPDATE public.partners SET tier = 'premium' WHERE tier = 'diamante';
```

## Fluxo da Correção

```text
ANTES:
┌─────────────────────────────────────────────────────┐
│ Frontend envia: tier = "premium"                    │
│ Banco valida: ['diamante', 'ouro', 'apoiador']     │
│ Resultado: ❌ ERRO - valor não permitido            │
└─────────────────────────────────────────────────────┘

DEPOIS:
┌─────────────────────────────────────────────────────┐
│ Frontend envia: tier = "premium"                    │
│ Banco valida: ['premium', 'ouro', 'apoiador']      │
│ Resultado: ✅ Sucesso                               │
└─────────────────────────────────────────────────────┘
```

## Arquivos/Recursos a Modificar

| Recurso | Alteração |
|---------|-----------|
| Banco de dados | Atualizar constraint `partners_tier_check` via migration |
| Dados existentes | Converter `tier = 'diamante'` para `tier = 'premium'` |

## Impacto
- Nenhuma mudança de código necessária (já foi alterado)
- Parceiros existentes com tier "diamante" serão migrados para "premium"
- Após a migration, será possível alterar o nível dos parceiros normalmente

