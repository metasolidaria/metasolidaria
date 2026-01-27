

## Alterar Expiração de Convites para 30 Dias

### Objetivo
Modificar o tempo de expiração dos convites de grupo de 7 para 30 dias, dando mais tempo para os convidados aceitarem.

---

### O que será alterado

**Banco de Dados**
- Atualizar o valor padrão da coluna `expires_at` na tabela `group_invitations`
- Mudar de `now() + '7 days'` para `now() + '30 days'`

---

### Detalhes Técnicos

A migração SQL executará:

```sql
ALTER TABLE public.group_invitations 
ALTER COLUMN expires_at 
SET DEFAULT (now() + '30 days'::interval);
```

---

### Comportamento

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Novos convites | Expiram em 7 dias | Expiram em 30 dias |
| Convites existentes | Mantêm data original | Mantêm data original |
| Validação | Sem alteração | Sem alteração |

---

### Impacto
- Apenas novos convites criados após a migração terão expiração de 30 dias
- Convites já existentes continuarão com suas datas de expiração originais
- Nenhuma alteração de código é necessária (apenas schema do banco)

