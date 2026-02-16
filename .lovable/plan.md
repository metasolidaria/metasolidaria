

## Otimizar Tutorial - Carregamento Lazy das Imagens

### Problema
As 7 imagens do tutorial estao sendo importadas via `import` estatico no topo do arquivo. O Vite inclui todas no bundle inicial, aumentando o tamanho do carregamento da pagina mesmo que o usuario nunca abra o tutorial.

### Solucao
Duas otimizacoes combinadas:

**1. Mover imagens para `/public/tutorial/` em vez de `src/assets/tutorial/`**
- Imagens em `/public` nao entram no bundle JS — sao servidas como arquivos estaticos
- Referenciadas por caminho absoluto (`/tutorial/step0.jpg`) em vez de import
- Isso ja elimina o peso do bundle inicial

**2. Lazy-load com `loading="lazy"` nas tags `<img>`**
- O navegador so carrega a imagem quando ela entra no viewport
- Como o modal so mostra 1 imagem por vez, as demais nao serao carregadas ate serem necessarias

**3. Lazy-load do proprio componente (code-splitting)**
- Usar `React.lazy()` para importar o `CreateGroupTutorialModal` no Header
- O codigo JS do modal so sera baixado quando o usuario clicar em "Criar Grupo"

### Alteracoes

**Mover arquivos:**
- `src/assets/tutorial/*.jpg` → `public/tutorial/*.jpg` (7 arquivos)

**Atualizar `src/components/CreateGroupTutorialModal.tsx`:**
- Remover os 7 `import` de imagens
- Usar caminhos absolutos no array `steps`: `image: "/tutorial/step0-botao-criar.jpg"`
- Adicionar `loading="lazy"` na tag `<img>`

**Atualizar `src/components/Header.tsx`:**
- Trocar import estatico por `React.lazy(() => import("./CreateGroupTutorialModal"))`
- Envolver com `<Suspense>` para carregamento sob demanda

### Resultado esperado
- Bundle inicial: sem impacto (0 KB adicionado)
- Imagens: carregadas sob demanda apenas quando o modal e aberto
- Codigo JS do modal: carregado sob demanda apenas no clique
