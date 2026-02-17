

## Unificar navegacao com menu hamburger em todas as telas

### Problema
O cabecalho desktop tem 7 itens de navegacao posicionados com `absolute left-1/2`, o que causa sobreposicao com o logo e os botoes de autenticacao em telas de tablet (768px-1024px) e desktops menores.

### Solucao
Remover a navegacao horizontal desktop e usar o menu hamburger (dropdown) em **todas as resolucoes**, igual ao mobile atual. Isso simplifica o cabecalho e elimina o problema de sobreposicao.

O cabecalho ficara com:
- Logo a esquerda
- Botao "Entrar" (ou nome do usuario + Sair) a direita
- Icone de menu hamburger a direita (ao lado do botao de auth)
- Ao clicar no hamburger, abre o dropdown com todos os links de navegacao

### Detalhes tecnicos

**Arquivo: `src/components/Header.tsx`**

1. Remover a `<nav>` desktop (linhas 66-107) que usa `hidden md:flex` e posicionamento absoluto
2. Remover `hidden md:flex` dos botoes de auth (linha 110) - tornar sempre visivel
3. Remover `md:hidden` do botao hamburger (linha 147) - tornar sempre visivel
4. Remover `md:hidden` do menu dropdown (linha 169) - tornar sempre visivel quando aberto
5. Mover o botao "Entrar/Sair" para fora do dropdown, mantendo-o sempre visivel no cabecalho ao lado do hamburger
6. Ajustar layout para: Logo | (espaco) | Botao Auth + Hamburger

Isso reaproveita todo o codigo do menu mobile existente, apenas removendo as classes `md:hidden` e `hidden md:flex` que separavam os dois modos.
