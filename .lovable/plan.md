

## Tutorial Expandido - 7 Passos Completos

Atualizar o tutorial de criacao de grupo de 3 para 7 passos, cobrindo o fluxo completo desde encontrar o botao ate ver a evolucao registrada.

### Estrutura dos 7 passos

| Passo | Titulo | Imagem | Status |
|-------|--------|--------|--------|
| 1 | Encontre o botao "Criar Grupo" na tela inicial | Screenshot_032426 (tela inicial com botao) | Novo |
| 2 | Preencha os dados do lider e do grupo | step1-dados-lider.jpg (ja existe) | Existente |
| 3 | Escolha a cidade, data e tipo de doacao | step2-tipo-doacao.jpg (ja existe) | Existente |
| 4 | Configure a meta padrao e privacidade | step3-meta-padrao.jpg (ja existe) | Existente |
| 5 | Adicione membros ou compartilhe convites | Screenshot_032549 (pagina do grupo com botoes) + Screenshot_032537 (modal incluir membro) + Screenshot_032553 (modal convite) | Novo |
| 6 | Registre a evolucao com "Incluir Evolucao" | Screenshot_032920 (botao incluir evolucao) + Screenshot_033022 (modal registrar doacao) | Novo |
| 7 | Acompanhe o progresso do grupo | Screenshot_033042 (meta do grupo com progresso e historico) | Novo |

### Alteracoes

**1. Copiar 4 novas imagens para `src/assets/tutorial/`**
- `step0-botao-criar.jpg` - Tela inicial mostrando o botao "Criar Grupo"
- `step4-pagina-grupo.jpg` - Pagina do grupo com botoes Adicionar Membro / Enviar Convite
- `step5-incluir-evolucao.jpg` - Modal de registrar doacao
- `step6-evolucao-registrada.jpg` - Progresso do grupo com historico de doacoes

Obs: Os prints do modal "Incluir Membro" e "Convidar Membro" servem como referencia visual para a descricao do passo 5, mas usaremos a imagem da pagina do grupo como print principal desse passo.

**2. Atualizar `src/components/CreateGroupTutorialModal.tsx`**
- Expandir o array `steps` de 3 para 7 itens
- Adicionar imports das 4 novas imagens
- Atualizar titulo do modal para "Como Criar e Gerenciar um Grupo"
- A navegacao (bolinhas, botoes, barra de progresso) ja funciona dinamicamente

### Detalhes tecnicos

Nenhuma mudanca no Header necessaria - a integracao ja esta pronta. Apenas o componente `CreateGroupTutorialModal.tsx` sera atualizado com os novos passos e imagens.

