
# Plano: Corrigir Campo de Cidade Apagando ao Editar Parceiro

## Problema Identificado

O componente `CityAutocomplete` não sincroniza seu estado interno (`query`) quando o valor externo (`value`) muda. Isso causa o bug reportado:

1. Usuário abre o modal de edição de um parceiro
2. O `EditPartnerModal` carrega os dados do parceiro via `useEffect`
3. O `formData.city` é atualizado corretamente com a cidade do parceiro
4. **Porém**, o `CityAutocomplete` mantém seu estado interno antigo (vazio ou do parceiro anterior)
5. O campo aparece vazio, obrigando o usuário a digitar novamente

## Solução

Adicionar um `useEffect` no componente `CityAutocomplete` para sincronizar o estado interno `query` sempre que o `value` prop mudar externamente.

## Arquivo a Modificar

**`src/components/CityAutocomplete.tsx`**

Adicionar após a linha 33:

```typescript
// Sync internal query state when external value changes
useEffect(() => {
  setQuery(value);
}, [value]);
```

## Antes vs Depois

**Antes:**
- Estado `query` definido apenas na montagem inicial
- Mudanças no prop `value` são ignoradas

**Depois:**
- Estado `query` sincronizado com `value` sempre que este mudar
- Campo exibe corretamente a cidade do parceiro ao abrir o modal

## Impacto

Esta correção também beneficiará outros componentes que usam `CityAutocomplete`:
- `CreatePartnerModal`
- `EditEntityModal`
- `AuthModal` (registro de usuário)
- `CreateGroupAdminModal`
