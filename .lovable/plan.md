
# Plano: Reorganizar Categorias de Parceiros

## Resumo
Atualizar a lista centralizada de especialidades de parceiros para corresponder à nova estrutura organizada por setores, com 61 categorias finais.

## Mudanças

### 1. Remover categorias (6)
- Agropecuária
- Comércio
- Empresa
- Hotel/Pousada
- Imobiliária
- Indústria

### 2. Renomear categorias (5)
- "Clube" → "Clube Esportivo/Associação"
- "Influencer" → "Influenciador/Criador de Conteúdo"
- "Mecânico" → "Oficina Mecânica"
- "Loja de brinquedos" → "Loja Infantil/Brinquedos"
- "Atleta" e "Personalidade" → "Atleta/Personalidade" (unificados)

### 3. Adicionar categorias novas (14)
- Laboratório/Clínica Popular
- Salão de Beleza
- Barbearia
- Clínica Estética
- Curso Livre/Profissionalizante
- Escola de Idiomas
- Auto Center
- Posto de Combustível
- Locadora de Veículos
- Eletricista
- Encanador
- Marcenaria/Serralheria
- ONG/Instituição Parceira

### 4. Atualizar componente de recomendação
O arquivo `src/components/RecommendPartnerModal.tsx` possui uma lista duplicada de especialidades que também precisa ser atualizada para usar a lista centralizada de `partnerSpecialties.ts`.

## Detalhes Técnicos

### Arquivo: `src/lib/partnerSpecialties.ts`
Substituir a lista atual por uma nova lista ordenada alfabeticamente com as 61 categorias:

```typescript
export const partnerSpecialties = [
  "Academia",
  "Açougue",
  "Advogado",
  "Arquiteto",
  "Atleta/Personalidade",
  "Auto Center",
  "Auto Peças",
  "Barbearia",
  "Cafeteria",
  "Clínica",
  "Clínica Estética",
  "Clube Esportivo/Associação",
  "Contador",
  "Consultor",
  "Corretor",
  "Curso Livre/Profissionalizante",
  "Dentista",
  "Despachante",
  "Eletricista",
  "Emissora",
  "Encanador",
  "Escola de Idiomas",
  "Escola/Colégio",
  "Esteticista",
  "Faculdade",
  "Farmácia",
  "Fisioterapeuta",
  "Hamburgueria",
  "Influenciador/Criador de Conteúdo",
  "Jornal",
  "Laboratório/Clínica Popular",
  "Lanchonete",
  "Lava Rápido",
  "Locadora de Veículos",
  "Loja de Calçados",
  "Loja de Cama, Mesa e Banho",
  "Loja de Eletro",
  "Loja de Móveis",
  "Loja de Roupas",
  "Loja Infantil/Brinquedos",
  "Marcenaria/Serralheria",
  "Material de Construção",
  "Médico",
  "Nutricionista",
  "Oficina Mecânica",
  "ONG/Instituição Parceira",
  "Padaria",
  "Personal Trainer",
  "Pet Shop",
  "Piscinas",
  "Posto de Combustível",
  "Psicólogo",
  "Restaurante",
  "Salão de Beleza",
  "Sorveteria",
  "Supermercado",
  "Veterinário",
] as const;
```

### Arquivo: `src/components/RecommendPartnerModal.tsx`
Atualizar o componente para importar e usar a lista centralizada `partnerSpecialties` em vez de manter uma lista duplicada local.

## Impacto nos dados existentes
Parceiros que já possuem especialidades que foram removidas ou renomeadas continuarão funcionando, mas suas especialidades antigas serão exibidas normalmente. Para padronizar, será necessário atualizar manualmente no painel de administração os parceiros com categorias antigas.
