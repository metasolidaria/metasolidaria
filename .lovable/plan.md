
# Plano: Esconder Cards de Entidades até Aplicar Filtro

## Resumo

Modificar a seção de Entidades Beneficiárias para mostrar os cards apenas quando:
1. O usuário selecionar uma cidade no filtro, **OU**
2. O usuário clicar em um botão "Ver Todas"

---

## Comportamento Proposto

### Estado Inicial (sem filtro)
- Título e descrição da seção visíveis
- Campo de busca por cidade visível
- Botão "Cadastrar Entidade" visível
- **Novo:** Botão "Ver Todas" para mostrar todas as entidades
- Cards **escondidos** com uma mensagem convidativa

### Após Aplicar Filtro ou Clicar "Ver Todas"
- Cards aparecem normalmente
- Se filtro por cidade: mostra entidades da cidade selecionada
- Se "Ver Todas": mostra todas as entidades

---

## Mudanças Técnicas

### Arquivo: `src/components/EntitiesSection.tsx`

1. **Novo estado `showAll`:**
   ```tsx
   const [showAll, setShowAll] = useState(false);
   ```

2. **Lógica de exibição:**
   ```tsx
   const shouldShowEntities = showAll || searchCity.trim().length > 0;
   ```

3. **Novo botão "Ver Todas":**
   - Aparece apenas quando `!shouldShowEntities`
   - Ao clicar, define `showAll = true`

4. **Estado inicial (cards escondidos):**
   - Quando `!shouldShowEntities`, exibir mensagem:
     > "Busque por uma cidade ou clique em 'Ver Todas' para visualizar as entidades cadastradas."

5. **Reset ao limpar filtro:**
   - Quando o usuário limpar o campo de cidade e `showAll` for false, volta ao estado inicial

---

## Fluxo Visual

```text
┌─────────────────────────────────────────┐
│       Entidades Beneficiárias           │
│  Organizações que recebem as doações... │
│                                         │
│   [+ Cadastrar Entidade]                │
│                                         │
│   🔍 [Buscar por cidade...]             │
│                                         │
│   [Ver Todas]                           │
│                                         │
│   ℹ️ Busque por uma cidade ou clique    │
│      em "Ver Todas" para visualizar     │
│      as entidades cadastradas.          │
└─────────────────────────────────────────┘

         ↓ Após filtrar ou "Ver Todas"

┌─────────────────────────────────────────┐
│   [Card 1] [Card 2] [Card 3] [Card 4]   │
│   [Card 5] [Card 6] ...                 │
└─────────────────────────────────────────┘
```

---

## Benefícios

- **Performance:** Não renderiza dezenas de cards desnecessariamente
- **UX:** Página inicial mais limpa e focada
- **Clareza:** Incentiva o usuário a buscar pela cidade de interesse

---

## Implementação

1. Adicionar estado `showAll` no componente
2. Criar condição `shouldShowEntities`
3. Adicionar botão "Ver Todas" com estilo outline
4. Criar componente de mensagem inicial quando cards estão escondidos
5. Manter lógica existente de filtro funcionando
