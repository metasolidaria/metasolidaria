

# Plano: Adicionar botão "Fale Conosco" na seção de Parceiros

## Resumo
Adicionar um botão "Fale Conosco" com link direto para o WhatsApp da Meta Solidária, posicionado logo abaixo do botão "Recomendar ou Seja Parceiro" na seção de Parceiros.

## O que será feito

1. **Adicionar o botão "Fale Conosco"** na seção de Parceiros, logo abaixo do botão existente "Recomendar ou Seja Parceiro"

2. **Estilização do botão**:
   - Usar variante `outline` para diferenciar visualmente do botão principal
   - Incluir ícone do WhatsApp para identificação clara
   - Manter consistência visual com o design atual

3. **Funcionalidade**:
   - Ao clicar, abrirá o WhatsApp com o número 19 99466-2603
   - Mensagem padrão: "Olá! Vim pelo site Meta Solidária."
   - Link: `https://wa.me/5519994662603?text=Olá! Vim pelo site Meta Solidária.`

## Layout visual esperado

```text
+------------------------------------------+
|          Guia de Parceiros               |
|                                          |
|  Encontre profissionais de saúde...      |
|                                          |
|  [🧑‍🤝‍🧑 Recomendar ou Seja Parceiro]       |  ← Botão principal (hero)
|  [📱 Fale Conosco]                       |  ← Novo botão (outline)
|                                          |
+------------------------------------------+
```

---

## Detalhes Técnicos

### Arquivo a ser modificado
- `src/components/PartnersSection.tsx`

### Alterações específicas

**Linhas 506-513** - Adicionar novo botão após o existente:

```tsx
<Button
  variant="hero"
  onClick={() => setIsRecommendModalOpen(true)}
  className="gap-2"
>
  <UserPlus className="w-4 h-4" />
  Recomendar ou Seja Parceiro
</Button>
{/* Novo botão Fale Conosco */}
<Button
  variant="outline"
  asChild
  className="gap-2 mt-2"
>
  <a
    href="https://wa.me/5519994662603?text=Olá! Vim pelo site Meta Solidária."
    target="_blank"
    rel="noopener noreferrer"
  >
    <Phone className="w-4 h-4" />
    Fale Conosco
  </a>
</Button>
```

### Dependências
- O ícone `Phone` já está importado no componente (linha 6)
- Nenhuma nova dependência necessária

