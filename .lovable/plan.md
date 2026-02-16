

## Mover "Como Funciona" para o menu e trocar botao flutuante por WhatsApp

### Resumo

1. O botao flutuante de duvida (canto inferior direito) sera substituido por um botao flutuante do WhatsApp (verde, com link direto para 19 99466-2603).
2. O item "Como Funciona" sera adicionado ao menu de navegacao (desktop e mobile), abrindo o mesmo popup que ja existe.

### Mudancas por arquivo

**1. `src/components/HowItWorksModal.tsx`**
- Remover o botao flutuante fixo e o estado interno.
- Receber props `open` e `onOpenChange` para ser controlado externamente.
- Manter todo o conteudo do modal (passos) como esta.

**2. Novo arquivo: `src/components/WhatsAppFloatingButton.tsx`**
- Botao flutuante verde (`bg-green-500`) no canto inferior direito (`fixed bottom-20 right-4`).
- Icone SVG do WhatsApp (mesmo usado no Footer).
- Abre link `https://wa.me/5519994662603?text=Olá! Vim pelo site Meta Solidária.` em nova aba.

**3. `src/components/Header.tsx`**
- Adicionar estado `isHowItWorksOpen`.
- Adicionar botao "Como Funciona" na navegacao desktop (ao lado dos outros itens de menu).
- Adicionar botao "Como Funciona" no menu mobile.
- Importar e renderizar o `HowItWorksModal` controlado pelo estado.

**4. `src/pages/Index.tsx`**
- Remover o `<HowItWorksModal />` e seu lazy import.
- Adicionar o `<WhatsAppFloatingButton />` no lugar.

### Resultado visual

- Menu desktop: Grupos | Instituicoes | Parceiros | Impacto | Como Funciona
- Menu mobile: mesmos itens incluindo "Como Funciona"
- Botao flutuante verde do WhatsApp no canto inferior direito
- Ao clicar "Como Funciona", abre o mesmo popup explicativo de sempre

