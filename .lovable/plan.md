
# Plano: Corrigir Exibição de Logos dos Parceiros

## Problema Identificado

O parceiro **Diego Felipe de Souza Bueno** (Veterinário) tem uma foto salva no banco de dados (`logo_url`), mas ela não aparece no app porque **os componentes não usam o campo `logo_url`**.

O código atual simplesmente exibe o logo padrão (`/logo.jpg`) para todos os parceiros, exceto "NaturUai":

```typescript
// Código problemático (atual)
src={partner.name === 'NaturUai' ? naturuaiLogo : logoImage}
```

---

## Solução

Atualizar a lógica de exibição de logos para seguir esta hierarquia:

1. Usar `logo_url` do banco de dados se disponível
2. Usar logo específico para "NaturUai" (asset estático)  
3. Usar logo padrão como fallback

---

## Arquivos a Modificar

### 1. `src/components/PartnersSection.tsx`

- Adicionar função `getPartnerLogo` que verifica `partner.logo_url` primeiro
- Atualizar o elemento `<img>` para usar essa função

### 2. `src/components/GoldPartnersCarousel.tsx`

- Atualizar a função `getPartnerLogo` existente para aceitar o objeto partner completo
- Verificar `partner.logo_url` antes de usar fallbacks

### 3. `src/components/HeroPremiumLogos.tsx`

- Já usa `partner.logo_url` corretamente (não precisa de alteração)

---

## Mudança de Código

Nova lógica para `getPartnerLogo`:

```typescript
const getPartnerLogo = (partner: { name?: string | null; logo_url?: string | null }) => {
  if (partner.logo_url) return partner.logo_url;
  if (partner.name === "NaturUai") return naturuaiLogo;
  return logoImage;
};
```

---

## Resultado Esperado

Após a correção, a foto do Diego Felipe de Souza Bueno (e de qualquer outro parceiro com `logo_url` cadastrado) aparecerá corretamente no Guia de Parceiros e no Carrossel.
