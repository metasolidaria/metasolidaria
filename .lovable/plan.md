
# Plano: Adicionar Botão "Fale Conosco" com WhatsApp

## Objetivo
Adicionar um botão "Fale Conosco" abaixo do botão "Recomendar ou Seja Parceiro" na seção de Parceiros, com link direto para o WhatsApp da Meta Solidária.

---

## Mudanças

### Arquivo: `src/components/PartnersSection.tsx`

**Adicionar** na linha 513 (logo após o botão "Recomendar ou Seja Parceiro"):

| Elemento | Descrição |
|----------|-----------|
| Novo Botão | "Fale Conosco" com ícone de WhatsApp |
| Variante | `outline` para diferenciar do botão principal |
| Link | WhatsApp: 19 99466-2603 |
| Mensagem | "Olá! Vim pelo site Meta Solidária." |

---

## Resultado Visual

```text
┌─────────────────────────────────────┐
│        Guia de Parceiros            │
│                                     │
│   Encontre profissionais de saúde   │
│   próximos de você...               │
│                                     │
│  [👤 Recomendar ou Seja Parceiro]   │  ← botão principal
│       [ 📱 Fale Conosco ]           │  ← novo botão
│                                     │
└─────────────────────────────────────┘
```

---

## Detalhes Técnicos

1. **Importar ícone** `MessageCircle` do lucide-react (ou usar SVG do WhatsApp)

2. **Adicionar botão** após a linha 513:
   ```tsx
   <Button
     variant="outline"
     onClick={() => {
       const message = encodeURIComponent("Olá! Vim pelo site Meta Solidária.");
       window.open(`https://wa.me/5519994662603?text=${message}`, "_blank");
     }}
     className="gap-2 ml-2"
   >
     <Phone className="w-4 h-4" />
     Fale Conosco
   </Button>
   ```

3. **Layout**: Os botões ficarão lado a lado em telas maiores, ou empilhados em mobile usando `flex-wrap`

4. **Estilo**: Usar variante `outline` para criar contraste visual com o botão principal `hero`
