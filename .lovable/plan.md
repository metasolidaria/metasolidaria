

# Plano: Adicionar Parceiro Ouro Nacional - Brave Sports

## Objetivo
Cadastrar a empresa **Brave Sports** como parceiro **Ouro** com visibilidade **nacional** (Brasil), incluindo contato via WhatsApp.

---

## Dados do Parceiro

| Campo | Valor |
|-------|-------|
| Nome | Brave Sports |
| Tier | ouro |
| Cidade | Brasil (visibilidade nacional) |
| Instagram | @bravesportsbr |
| WhatsApp | 19 99102-9475 |
| Especialidade | Atleta/Personalidade |
| Aprovado | Sim |

---

## Passos de Implementação

### 1. Salvar Logo no Projeto
- Salvar a imagem extraída do PDF como `public/brave-sports-logo.png`

### 2. Inserir no Banco de Dados

```sql
INSERT INTO partners (
  name,
  tier,
  city,
  instagram,
  whatsapp,
  specialty,
  is_approved,
  logo_url
) VALUES (
  'Brave Sports',
  'ouro',
  'Brasil',
  '@bravesportsbr',
  '19991029475',
  'Atleta/Personalidade',
  true,
  '/brave-sports-logo.png'
);
```

---

## Resultado Visual

O parceiro aparecerá com dois botões de contato:

```text
┌─────────────────────────────────────┐
│  [Logo]  Brave Sports      [Ouro 👑]│
│  Atleta/Personalidade               │
│  Brasil                             │
│                                     │
│  [📱 Entrar em Contato] [📷 Insta]  │
└─────────────────────────────────────┘
```

- **Botão WhatsApp**: Abre conversa com mensagem "Olá Brave Sports! Encontrei seu contato no Meta Solidária."
- **Botão Instagram**: Abre perfil @bravesportsbr

---

## Visibilidade

1. **FeaturedPartnerSpotlight** - Rotação na página inicial
2. **Guia de Parceiros** - Com selo dourado "Ouro"
3. **GoldPartnersCarousel** - Visível em todas as páginas de grupos
4. **Nacional** - Aparece para usuários de qualquer cidade

