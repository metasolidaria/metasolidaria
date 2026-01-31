
# Plano: Corrigir Clique em Parceiros Premium no Carrossel

## Problema Identificado

No carrossel "Parceiros Solidários" dentro da página do grupo, ao clicar em um parceiro Premium (como NaturUai), nada acontece. Isso ocorre porque:

1. O componente `GoldPartnersCarousel.tsx` usa apenas `handleWhatsAppClick` para todos os parceiros
2. Parceiros Premium como NaturUai têm o campo `whatsapp` vazio
3. A função retorna imediatamente quando `whatsapp` está vazio, sem executar nenhuma ação

### Comportamento Esperado (já implementado no Hero)

- **Parceiros Premium**: devem abrir o perfil do Instagram ao clicar
- **Parceiros Ouro**: devem abrir o WhatsApp ao clicar

## Solucao

Adicionar tratamento diferenciado no `GoldPartnersCarousel.tsx` para que parceiros Premium abram o Instagram, seguindo o mesmo padrao do `HeroPremiumLogos.tsx`.

---

## Etapas de Implementacao

### Etapa 1: Adicionar funcao para Instagram

Criar funcao `handleInstagramClick` no componente:

```typescript
const handleInstagramClick = (partner: { instagram?: string | null }) => {
  if (!partner.instagram) return;
  const handle = partner.instagram.replace(/^@/, "").trim();
  window.open(`https://instagram.com/${handle}`, "_blank");
};
```

### Etapa 2: Criar funcao unificada de clique

Criar funcao `handlePartnerClick` que decide qual acao tomar com base no tier:

```typescript
const handlePartnerClick = (partner: Partner) => {
  if (partner.is_test) return;
  
  if (isPremium(partner.tier)) {
    // Premium abre Instagram
    handleInstagramClick(partner);
  } else {
    // Ouro abre WhatsApp
    handleWhatsAppClick(partner);
  }
};
```

### Etapa 3: Atualizar o onClick do Card

Substituir `onClick={() => handleWhatsAppClick(partner)}` por `onClick={() => handlePartnerClick(partner)}`.

### Etapa 4: Atualizar texto de orientacao

Alterar o texto explicativo no rodape do carrossel para refletir os dois comportamentos:

```
De: "Clique em um parceiro para entrar em contato via WhatsApp"
Para: "Clique em um parceiro para visitar o perfil ou WhatsApp"
```

---

## Arquivo Afetado

| Arquivo | Mudanca |
|---------|---------|
| `src/components/GoldPartnersCarousel.tsx` | Adicionar logica diferenciada para Premium (Instagram) vs Ouro (WhatsApp) |

---

## Resultado Esperado

- Clicar em NaturUai (Premium) abrira o Instagram `instagram.com/naturuai_`
- Clicar em parceiros Ouro (nao-teste) abrira WhatsApp normalmente
- Parceiros de teste continuarao sem acao ao clicar
