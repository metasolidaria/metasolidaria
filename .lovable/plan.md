
# Plano: Identificar e Rotular Parceiros de Teste

## Objetivo
Adicionar identificação visual para parceiros de teste (seed data), desabilitando os botões de contato (WhatsApp e Instagram) e exibindo um rótulo "Parceiro Teste" para que os usuários saibam que são dados de demonstração.

---

## Abordagem

A melhor estratégia é adicionar uma coluna `is_test` na tabela `partners` para marcar os parceiros de teste. Isso permite:
- Identificação precisa no banco de dados
- Flexibilidade para adicionar/remover parceiros de teste facilmente
- Lógica simples no frontend

---

## Etapas de Implementação

### Etapa 1: Migração do Banco de Dados

Adicionar coluna `is_test` na tabela `partners`:

```text
ALTER TABLE partners ADD COLUMN is_test BOOLEAN DEFAULT false;

-- Marcar os parceiros existentes do seed como teste
UPDATE partners SET is_test = true WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  'a5555555-5555-5555-5555-555555555555',
  'a6666666-6666-6666-6666-666666666666',
  'a7777777-7777-7777-7777-777777777777',
  'a8888888-8888-8888-8888-888888888888',
  'a9999999-9999-9999-9999-999999999999',
  'aa000000-0000-0000-0000-000000000000'
);
```

Atualizar a view `partners_public` para incluir `is_test`.

### Etapa 2: Atualizar Interface Partner

Adicionar o campo `is_test` ao tipo `Partner`:

```text
interface Partner {
  // ... campos existentes
  is_test: boolean;
}
```

### Etapa 3: Modificar PartnersSection.tsx

Alterar a renderização dos cards de parceiros:

1. **Badge "Parceiro Teste"**: Exibir quando `partner.is_test === true`
2. **Desabilitar WhatsApp**: Não mostrar botão ou mostrar desabilitado
3. **Desabilitar Instagram**: Não mostrar ícone ou mostrar desabilitado
4. **Estilo visual diferenciado**: Opacidade reduzida ou borda tracejada

Exemplo de modificação no card:

```text
{partner.is_test && (
  <span className="inline-flex items-center gap-1 text-xs font-medium 
    px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
    🧪 Parceiro Teste
  </span>
)}

{/* Botão WhatsApp - desabilitado para teste */}
<Button
  disabled={partner.is_test}
  title={partner.is_test ? "Contato indisponível (parceiro teste)" : undefined}
  ...
>
  Entrar em Contato
</Button>

{/* Instagram - não exibir para teste */}
{partner.instagram && !partner.is_test && (
  <Button ...>
    <Instagram />
  </Button>
)}
```

### Etapa 4: Modificar GoldPartnersCarousel.tsx

Aplicar a mesma lógica no carrossel de parceiros solidários:

1. Adicionar badge "Teste" se `partner.is_test`
2. Desabilitar clique no WhatsApp para parceiros de teste
3. Mostrar tooltip informando que é parceiro de demonstração

### Etapa 5: Modificar PremiumPartnerSlots.tsx

Para parceiros premium de teste:

1. Desabilitar clique no Instagram
2. Adicionar indicação visual de teste no tooltip

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/migrations/` | Nova migração para `is_test` |
| `src/hooks/usePartners.tsx` | Atualizar tipo Partner |
| `src/hooks/usePaginatedPartners.tsx` | Incluir `is_test` na query |
| `src/hooks/useGoldPartners.tsx` | Incluir `is_test` na query |
| `src/components/PartnersSection.tsx` | Renderização condicional |
| `src/components/GoldPartnersCarousel.tsx` | Renderização condicional |
| `src/components/PremiumPartnerSlots.tsx` | Renderização condicional |

---

## Resultado Visual Esperado

**Card de Parceiro Teste:**
- Badge cinza "🧪 Parceiro Teste" no topo
- Botão "Entrar em Contato" desabilitado (cinza)
- Ícone do Instagram não aparece
- Visual levemente mais apagado para indicar que é demonstração

**Tooltip em Parceiros Premium Teste:**
- Mostra "Parceiro de demonstração" 
- Não abre Instagram ao clicar

---

## Detalhes Técnicos

### Migração SQL Completa

A migração deve:
1. Adicionar coluna `is_test` com default `false`
2. Atualizar parceiros seed existentes
3. Recriar view `partners_public` incluindo o novo campo

### Lógica de Identificação

Os parceiros de teste podem ser identificados pelo padrão de UUID usado no seed:
- `aXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

Alternativamente, podemos marcar manualmente ou por descrição contendo palavras-chave específicas.

### Considerações de Segurança

- A coluna `is_test` será exposta na view pública (não é dado sensível)
- Parceiros de teste continuam aparecendo nas listagens, apenas com tratamento visual diferenciado
