
# Plano: Desativar Parceiros de Teste

## Situação Atual

Existem **10 parceiros de teste** no banco de dados, identificados pelo campo `is_test = true`:

| Nome | Tier |
|------|------|
| Supermercado Bom Preço | ouro |
| Farmácia Saúde Total | ouro |
| Academia Corpo em Forma | apoiador |
| Restaurante Sabor da Terra | apoiador |
| Pet Shop Amigo Fiel | apoiador |
| Padaria Pão Quente | apoiador |
| Loja de Roupas Elegância | apoiador |
| Clínica Dr. Carlos | apoiador |
| Hamburgueria Artesanal | apoiador |
| Loja de Móveis Casa Nova | apoiador |

---

## Opção Recomendada: Desaprovar (manter no banco)

Definir `is_approved = false` para todos os parceiros de teste. Assim eles não aparecem mais no app, mas ficam preservados caso você queira reativá-los no futuro para demonstrações.

### Comando SQL

```sql
UPDATE partners 
SET is_approved = false 
WHERE is_test = true;
```

---

## Opção Alternativa: Deletar permanentemente

Se preferir remover completamente os dados de teste:

```sql
DELETE FROM partners 
WHERE is_test = true;
```

---

## Resultado

Após a execução, os parceiros de teste não aparecerão mais em nenhum lugar do app (guia de parceiros, carrossel, hero, etc.).

---

## Arquivos Afetados

Nenhuma alteração de código é necessária. As queries já filtram por `is_approved = true`, então basta atualizar o banco de dados.
