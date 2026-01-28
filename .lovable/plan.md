
# Plano: Corrigir Layout do Doadômetro na Versão Web

## Problema
Na versão web, o layout do Doadômetro está quebrando:
- O parceiro premium (NaturUai) aparece à direita no topo, desalinhado
- Os 7 cards de tipos de doação não cabem em 6 colunas, fazendo o último (Brinquedos) quebrar para uma linha sozinha

## Solução Proposta
Reorganizar o layout para que fique igual ao mobile: tudo centralizado e empilhado verticalmente, com o parceiro premium aparecendo abaixo dos cards de doação.

## Alterações

### 1. Componente ImpactCounter.tsx

**Mudanças no grid principal:**
- Remover o layout side-by-side (`lg:grid-cols-4`)
- Usar layout vertical para todas as telas

**Mudanças no grid de tipos de doação:**
- Ajustar de `lg:grid-cols-6` para `lg:grid-cols-7` (acomodar todos os 7 tipos)
- Ou usar `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7` para melhor responsividade

**Mover parceiro premium para baixo:**
- Posicionar a seção de parceiros premium centralizada abaixo dos cards de doação

### 2. Estrutura Visual Final

```text
┌─────────────────────────────────────────────┐
│              🤍 Doadômetro                  │
│    Impacto social gerado até o momento      │
│                                             │
│              313.597                        │
│          doações realizadas                 │
│                                             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│  │Alm│ │Liv│ │Rou│ │Cob│ │Sop│ │Hig│ │Bri│ │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
│                                             │
│          ⭐ Parceiros Premium               │
│             [NaturUai]                      │
└─────────────────────────────────────────────┘
```

### Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/ImpactCounter.tsx` | Reorganizar grid para layout vertical, ajustar colunas dos cards |

---

## Detalhes Técnicos

**Grid principal (antes):**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
  <div className="lg:col-span-3">...</div>
  <div className="lg:col-span-1">...</div>
</div>
```

**Grid principal (depois):**
```jsx
<div className="flex flex-col items-center">
  <div className="w-full max-w-5xl">...</div>
  <div className="mt-8">...</div>
</div>
```

**Grid de tipos (antes):**
```jsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
```

**Grid de tipos (depois):**
```jsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
```

---

## Resultado Esperado
- Layout consistente entre mobile e web
- Todos os 7 cards de tipos de doação em uma única linha no desktop
- Parceiro premium centralizado abaixo das estatísticas
- Visual limpo e organizado em todas as resoluções
