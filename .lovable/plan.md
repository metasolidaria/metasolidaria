

## Exportar Tutorial em PDF

### Abordagem
Adicionar um botao "Baixar PDF" no modal do tutorial que gera um PDF com todos os 7 passos (imagem + titulo + descricao) em um unico documento, usando as bibliotecas `jspdf` e `html2canvas`.

### Como vai funcionar
- Um botao "Baixar PDF" aparece no rodape do modal (ao lado dos botoes de navegacao)
- Ao clicar, o sistema renderiza uma div oculta com todos os 7 passos lado a lado (verticalmente)
- Usa `html2canvas` para capturar cada passo e `jspdf` para montar o PDF final
- Cada passo ocupa uma pagina do PDF com a imagem + titulo + descricao
- O PDF e baixado automaticamente como `tutorial-meta-solidaria.pdf`

### Detalhes tecnicos

**1. Instalar dependencias**
- `jspdf` - para gerar o PDF
- `html2canvas` - para capturar os elementos HTML como imagem

**2. Atualizar `src/components/CreateGroupTutorialModal.tsx`**
- Adicionar funcao `handleExportPDF` que:
  - Cria um elemento temporario invisivel no DOM com todos os passos
  - Para cada passo, renderiza imagem + titulo + descricao
  - Usa `html2canvas` para capturar cada passo
  - Usa `jspdf` para criar o documento com uma pagina por passo
  - Remove o elemento temporario
  - Dispara o download
- Adicionar botao "Baixar PDF" com icone `Download` no header do modal
- Mostrar estado de loading ("Gerando PDF...") enquanto processa

**3. Otimizacao de performance**
- As bibliotecas `jspdf` e `html2canvas` serao importadas via `import()` dinamico (lazy), so carregadas quando o usuario clicar em "Baixar PDF"
- Nenhum impacto no bundle inicial

