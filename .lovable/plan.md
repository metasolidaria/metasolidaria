
# Plano: Atualizar Filtro de Categorias na Aba Parceiros

## Problema Identificado
O componente `PartnersSection.tsx` possui uma lista duplicada e desatualizada de categorias (`allCategories`) nas linhas 51-99 que **não está sincronizada** com a lista centralizada de `partnerSpecialties.ts`.

### Lista Atual (Desatualizada)
- Contém 47 categorias + "Todos"
- Ainda tem: Agropecuária, Comércio, Empresa, Imobiliária, Indústria, Político
- Usa nomes antigos: Jogador, Influencer, Mecânico, Clube, Loja de brinquedos
- Faltam novas categorias: Arquiteto, Auto Center, Clínica Estética, Esteticista, Faculdade, etc.

## Solução
Atualizar o componente `PartnersSection.tsx` para:
1. Importar a lista centralizada `partnerSpecialties` de `src/lib/partnerSpecialties.ts`
2. Gerar dinamicamente o array `allCategories` a partir dessa lista
3. Manter os ícones apropriados para cada categoria

## Mudanças Técnicas

### Arquivo: `src/components/PartnersSection.tsx`

1. **Adicionar import** da lista centralizada:
```typescript
import { partnerSpecialties } from "@/lib/partnerSpecialties";
```

2. **Criar mapeamento de ícones** por categoria ou padrão:
```typescript
const categoryIcons: Record<string, LucideIcon> = {
  // Alimentação
  "Açougue": Store,
  "Padaria": Store,
  "Restaurante": Store,
  // Saúde
  "Clínica": Building2,
  "Médico": Stethoscope,
  "Dentista": Stethoscope,
  // etc.
};
```

3. **Gerar `allCategories` dinamicamente**:
```typescript
const allCategories = [
  { id: "all", label: "Todos", icon: Star },
  ...partnerSpecialties.map(specialty => ({
    id: specialty,
    label: specialty,
    icon: categoryIcons[specialty] || Store, // ícone padrão
  })),
  { id: "Outros", label: "Outros", icon: MoreHorizontal },
];
```

## Resultado Esperado
- O filtro de categorias na aba "Parceiros" exibirá as **57 categorias atualizadas**
- Novas categorias como Arquiteto, Esteticista, Faculdade aparecerão no filtro
- Categorias removidas (Político, Agropecuária, etc.) não aparecerão mais
- Qualquer alteração futura em `partnerSpecialties.ts` será refletida automaticamente no filtro
