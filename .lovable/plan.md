
# Plano: Corrigir exibição de metas no dashboard de administração de grupos

## Diagnóstico

### Problema Identificado
Na página de Administração de Grupos (`/admin/grupos`), a coluna "Meta" está exibindo o valor incorreto:
- **Exibindo**: `g.goal_2026` = 0 (campo legado da tabela groups)
- **Deveria exibir**: `g.total_goals` = 22 (soma das metas individuais dos membros)

### Evidência
Consulta direta no banco confirmou:
- Grupo "Gerando futuro" tem `goal_2026: 0`
- View materializada `group_stats` tem `total_goals: 22`
- Os membros possuem 3 blocos de compromisso com metas definidas em `member_commitments`

### Causa Raiz
O sistema de metas foi reestruturado para usar "blocos de compromisso" (`member_commitments`), mas a interface de administração ainda referencia o campo antigo `goal_2026`.

---

## Solução Proposta

### 1. Atualizar AdminGroups.tsx
Modificar a exibição da coluna "Meta" para usar `total_goals`:

**Arquivo**: `src/pages/AdminGroups.tsx`
- **Linha 255**: Trocar `{g.goal_2026}` por `{g.total_goals}`
- Adicionar indicador visual quando não houver metas definidas

### 2. Melhorar o cabeçalho da coluna
Renomear o cabeçalho para "Metas" (plural) para refletir que é a soma das metas individuais dos membros.

---

## Detalhes Técnicos

```text
Antes (linha 255):
<TableCell className="text-right">{g.goal_2026}</TableCell>

Depois:
<TableCell className="text-right">
  {g.total_goals > 0 ? g.total_goals : (
    <span className="text-muted-foreground">-</span>
  )}
</TableCell>
```

### Opcional: Exibir ambos os valores
Se for útil manter visibilidade da meta global do grupo vs. metas individuais:
- Coluna "Meta do Grupo": `goal_2026` (meta definida pelo líder)
- Coluna "Metas Individuais": `total_goals` (soma das metas dos membros)

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/AdminGroups.tsx` | Linha 223: "Meta" → "Metas" |
| `src/pages/AdminGroups.tsx` | Linha 255: `g.goal_2026` → `g.total_goals` |

---

## Resultado Esperado
Após a correção:
- Grupo "Gerando futuro" exibirá **22** na coluna de metas
- Grupos sem metas individuais exibirão **-** ou **0**
- A informação ficará consistente com a página do grupo
