

## Corrigir layout do cabecalho em tablet e mobile

### Problemas identificados

1. **Mobile (390px)**: O nome do usuario ("dbmetas..."), botao "Sair" e icone hamburger ocupam todo o espaco, empurrando elementos para fora da tela
2. **Tablet (834px)**: Os 4 itens de navegacao + nome do usuario + botao Sair + hamburger ficam apertados demais no cabecalho

### Solucao

Simplificar o cabecalho mantendo apenas o essencial visivel, e mover informacoes do usuario para dentro do menu hamburger.

**Layout do cabecalho em todas as telas:**
- Logo a esquerda
- Links de navegacao no centro (apenas em `md+`, como ja esta)
- Botao "Entrar" (se deslogado) + Hamburger a direita

**Quando logado**: remover o nome do usuario e o botao "Sair" do cabecalho. Esses itens ficam **dentro do menu hamburger**, liberando espaco.

### Detalhes tecnicos

**Arquivo: `src/components/Header.tsx`**

1. Mover os botoes de usuario logado (nome + Sair) para dentro do dropdown menu
   - Adicionar no topo do dropdown: nome do usuario com icone Settings e botao Sair
   - No cabecalho, quando logado, mostrar apenas um icone de usuario (sem texto) para economizar espaco

2. Quando deslogado: manter botao "Entrar" compacto ao lado do hamburger

3. No mobile (`< md`), o cabecalho fica: Logo | Icone usuario (se logado) ou "Entrar" | Hamburger

4. No tablet/desktop (`md+`), o cabecalho fica: Logo | Grupos, Como Funciona, Criar Grupo, Baixar App | Icone usuario ou "Entrar" | Hamburger

**Mudancas especificas:**

- Substituir o botao com nome do usuario + botao "Sair" no cabecalho por um unico botao icone (Settings ou User) quando logado
- Adicionar secao de usuario no topo do dropdown com: nome completo, link para perfil, e botao sair
- Adicionar separador visual entre a secao do usuario e os links de navegacao no dropdown

Isso resolve o overflow em mobile e o aperto em tablet, mantendo todas as funcionalidades acessiveis.
