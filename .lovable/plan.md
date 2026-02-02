
# Plano: Adicionar Selos de Tier nos Cards de Parceiros

## Situação Atual

O código já exibe um selo "Ouro" amarelo para parceiros `ouro` e `premium`, mas:
- Parceiros **Premium** mostram "Ouro" (incorreto)
- Parceiros **Apoiador** não têm selo (falta adicionar)

## Alterações no `src/components/PartnersSection.tsx`

Vou modificar a seção de badges (linhas 652-665) para exibir selos diferentes por tier:

| Tier | Selo | Cor | Ícone |
|------|------|-----|-------|
| **premium** | "Premium" | Roxo/Ciano | Crown |
| **ouro** | "Ouro" | Amarelo | Crown |
| **apoiador** | "Apoiador" | Rosa | Heart |

### Código Antes:
```tsx
{(partner.tier === 'ouro' || partner.tier === 'premium') && (
  <span className="... bg-yellow-500 text-yellow-900">
    <Crown /> Ouro
  </span>
)}
```

### Código Depois:
```tsx
{partner.tier === 'premium' && (
  <span className="... bg-purple-500 text-white">
    <Crown /> Premium
  </span>
)}
{partner.tier === 'ouro' && (
  <span className="... bg-yellow-500 text-yellow-900">
    <Crown /> Ouro
  </span>
)}
{partner.tier === 'apoiador' && (
  <span className="... bg-rose-500 text-white">
    <Heart /> Apoiador
  </span>
)}
```

## Também Atualizar o Destaque Visual (Ring)

Atualmente, só parceiros Ouro/Premium têm um anel dourado. Vou adicionar um anel rosa suave para apoiadores:

- **Premium**: `ring-purple-500/50`
- **Ouro**: `ring-yellow-500/50`
- **Apoiador**: `ring-rose-400/30` (mais sutil)

## Arquivo a Modificar

- `src/components/PartnersSection.tsx`

## Resultado Visual

Cada card de parceiro terá seu selo correspondente ao tier, tornando fácil identificar o nível de parceria visualmente.
