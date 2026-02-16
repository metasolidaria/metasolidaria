

## Tutorial "Como Criar um Grupo" - Modal com Screenshots

### Resumo
Criar um modal passo a passo no menu de navegacao mostrando como criar um grupo, usando os 3 prints enviados como ilustracao de cada etapa.

### Passos

**1. Copiar as 3 imagens para `src/assets/tutorial/`**
- `step1-dados-lider.jpg` - Screenshot do topo do formulario (nome do lider, WhatsApp, nome do grupo, descricao, foto)
- `step2-tipo-doacao.jpg` - Screenshot da cidade, data, tipo de doacao
- `step3-meta-padrao.jpg` - Screenshot da meta padrao para membros, grupo privado, membros visiveis, botoes

**2. Criar `src/components/CreateGroupTutorialModal.tsx`**
- Modal controlado por props `open` e `onOpenChange` (mesmo padrao dos outros modais)
- Layout em carrossel/stepper com 3 passos:
  - Passo 1: "Preencha os dados do lider e do grupo" + imagem step1
  - Passo 2: "Escolha a cidade, data e tipo de doacao" + imagem step2
  - Passo 3: "Configure a meta padrao e privacidade" + imagem step3
- Botoes "Anterior" / "Proximo" / "Fechar" para navegar entre os passos
- Indicador de progresso (bolinhas ou barra)

**3. Atualizar `src/components/Header.tsx`**
- Adicionar estado `isTutorialOpen`
- Adicionar item "Criar Grupo" no menu desktop e mobile (icone `BookOpen` ou `GraduationCap`)
- Renderizar o `CreateGroupTutorialModal` controlado pelo estado

### Detalhes tecnicos

- As imagens serao importadas como modulos ES6 via `src/assets/tutorial/`
- O modal usara o componente `Dialog` existente com `max-w-md`
- Cada passo mostra a imagem com `rounded-lg shadow` e texto descritivo abaixo
- Navegacao entre passos via estado local `currentStep`

