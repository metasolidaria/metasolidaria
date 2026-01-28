

# Plano: Adicionar Colunas de Expiração de Parceria

## Objetivo
Adicionar duas novas colunas na tabela de administração de parceiros:
1. **Data de Expiração** - editável pelo administrador
2. **Dias até Expiração** - calculado automaticamente (data expiração - hoje)

## Alterações Necessárias

### 1. Migração de Banco de Dados

Adicionar coluna `expires_at` na tabela `partners`:

```sql
ALTER TABLE public.partners 
ADD COLUMN expires_at date DEFAULT NULL;

COMMENT ON COLUMN public.partners.expires_at IS 
  'Data de expiração da parceria';
```

### 2. Atualizar Componente AdminPartners.tsx

#### 2.1 Adicionar novas colunas na tabela

| Coluna | Descrição |
|--------|-----------|
| Expiração | Data de expiração editável com DatePicker inline |
| Dias Restantes | Cálculo automático: `expires_at - hoje` |

#### 2.2 Lógica de exibição dos dias restantes

```text
┌──────────────────────────────────────────────────────────┐
│ Dias Restantes    │ Estilo                              │
├───────────────────┼─────────────────────────────────────┤
│ > 30 dias         │ Verde (normal)                      │
│ 7-30 dias         │ Amarelo (atenção)                   │
│ 1-7 dias          │ Laranja (urgente)                   │
│ 0 ou negativo     │ Vermelho (expirado)                 │
│ Sem data          │ Cinza "Indefinido"                  │
└──────────────────────────────────────────────────────────┘
```

### 3. Atualizar EditPartnerModal.tsx

Adicionar campo de seleção de data de expiração usando o componente DatePicker com Popover e Calendar.

### 4. Atualizar CreatePartnerModal.tsx

Adicionar campo opcional de data de expiração para novos parceiros.

### 5. Atualizar Hook useAdminPartners.tsx

Incluir o campo `expires_at` nas operações de criação e atualização.

### 6. Atualizar Tipos TypeScript

O tipo `Partner` em `usePartners.tsx` será atualizado automaticamente após a migração.

## Interface Visual

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Nome      │ Cidade │ Especialidade │ Nível  │ Status │ Expiração  │ Dias   │
├───────────┼────────┼───────────────┼────────┼────────┼────────────┼────────┤
│ NaturUai  │ Ouro F │ Loja Natural  │ Ouro   │ Aprov  │ 📅 15/06/26│ 🟢 138 │
│ Clínica X │ Jacuti │ Nutricionista │ Apoiad │ Aprov  │ 📅 01/03/26│ 🟡 32  │
│ Parceiro Y│ Monte S│ Personal      │ Diamat │ Aprov  │ 📅 05/02/26│ 🟠 8   │
│ Antigo Z  │ Bueno  │ Veterinário   │ Apoiad │ Aprov  │ 📅 20/01/26│ 🔴 -8  │
│ Novo W    │ Águas L│ Pet Shop      │ Apoiad │ Penden │ —          │ ⚪ —   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Funcionalidades

1. **Edição Inline Rápida**: Clicar no ícone de calendário abre um popover para selecionar a data
2. **Atualização Automática**: O contador de dias é calculado em tempo real
3. **Ordenação**: Nova coluna "Expiração" será ordenável
4. **Visual Intuitivo**: Cores indicam urgência da renovação

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Adicionar coluna `expires_at` |
| `src/pages/AdminPartners.tsx` | Novas colunas + DatePicker inline |
| `src/components/EditPartnerModal.tsx` | Campo de data de expiração |
| `src/components/CreatePartnerModal.tsx` | Campo opcional de expiração |
| `src/hooks/usePartners.tsx` | Tipo Partner (atualizado automaticamente) |

