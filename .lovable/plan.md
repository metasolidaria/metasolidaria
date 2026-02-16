
## Mover Parceiros Solidários para o final da página do grupo

Atualmente, o carrossel de parceiros ouro (`GoldPartnersCarousel`) aparece logo no topo do conteudo, antes das seções de progresso e membros. A mudanca vai movê-lo para o final da pagina, depois de todo o conteudo principal.

### O que sera feito

**Arquivo: `src/pages/GroupPage.tsx`**

1. Remover o `GoldPartnersCarousel` da posicao atual (linhas 396-399), que fica acima do grid principal.
2. Inserir o `GoldPartnersCarousel` logo apos o fechamento do grid (apos a linha 742), ficando como ultimo elemento visivel da pagina antes dos modais.

### Resultado

A ordem na pagina do grupo ficara:
1. Header (com badges, nome, cidade, PremiumLogosCarousel)
2. Botoes do lider (se aplicavel)
3. Meta do grupo / Progresso
4. Historico de doacoes
5. Membros e Resumo (sidebar)
6. **Parceiros Solidarios (Gold Partners Carousel)** -- movido para ca

### Detalhes tecnicos

Apenas reposicionar o bloco JSX do `GoldPartnersCarousel` dentro do mesmo container (`div.container`), movendo-o de antes do `grid` para depois dele. Nenhuma alteracao de logica ou props.
