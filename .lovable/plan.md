

## Adicionar novas opções de doação

Adicionar duas novas opções à lista `DONATION_OPTIONS` em `src/hooks/useEntities.tsx`:

1. **"materiais_escolar"** — Label: "Materiais Escolar"
2. **"kit_limpeza"** — Label: "Kit de Limpeza"

### Arquivo alterado
- `src/hooks/useEntities.tsx` — adicionar os dois itens ao array `DONATION_OPTIONS`

Nenhuma outra alteração necessária, pois todos os modais e componentes já consomem essa lista dinamicamente.

