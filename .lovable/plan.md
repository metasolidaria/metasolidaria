

# Plano: Melhorar Conversao da Homepage para Reduzir Rejeicao

## Contexto (Analytics ultimos 7 dias)

- **56 visitantes**, 81 pageviews, **87% bounce rate**
- **72% mobile**, 27% desktop
- Fontes: 70% Direto, 8% Instagram, 4% Google, 4% Facebook
- 48 de 81 pageviews ficaram apenas na `/` (homepage)
- Sessao media: ~4 segundos (muito baixo)
- Pageviews por visita: 1.45

**Diagnostico**: Visitantes chegam (maioria via celular/redes sociais), veem o Hero e saem. Nao encontram motivacao suficiente para rolar ou interagir.

---

## Mudancas Propostas

### 1. Adicionar secao "Como Funciona" resumida no Hero

O componente `HowItWorks` ja existe mas esta muito abaixo na pagina (nao aparece no Index.tsx). Adicionar uma versao compacta de 3 passos logo abaixo dos botoes do Hero, antes dos stats.

**Arquivo:** `src/components/Hero.tsx`
- Adicionar 3 icones com texto curto inline: "Crie um grupo" → "Defina metas" → "Doe para quem precisa"
- Layout horizontal em desktop, vertical compacto em mobile
- Sem lazy load (conteudo critico acima da dobra)

### 2. Mostrar preview de grupos ativos no Hero

Adicionar um mini-carousel ou lista de 2-3 grupos publicos ativos com progresso visivel logo abaixo do Hero, antes da secao ImpactCounter.

**Novo arquivo:** `src/components/HeroGroupsPreview.tsx`
- Query leve: buscar 3 grupos publicos com mais membros
- Mostrar: nome, cidade, tipo de doacao, numero de membros
- CTA: "Ver todos os grupos" que scrolla para a secao de grupos
- Lazy loaded com Suspense (esta abaixo da dobra)

**Arquivo:** `src/pages/Index.tsx`
- Inserir `HeroGroupsPreview` entre `Hero` e `ImpactCounter`

### 3. CTA mais direto no mobile

**Arquivo:** `src/components/Hero.tsx`
- Alterar o botao principal de "Criar Grupo" para "Participar Agora" no mobile (mais acessivel para quem nao conhece a plataforma)
- Manter "Criar Grupo" como botao secundario
- Adicionar micro-texto de prova social: "Junte-se a X+ voluntarios"

### 4. Adicionar secao "Como Funciona" completa ao Index

**Arquivo:** `src/pages/Index.tsx`
- Importar o `HowItWorks` existente (lazy)
- Posicionar entre `ImpactCounter` e `GroupsSection`

---

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/Hero.tsx` | Mini "como funciona" inline + CTA reordenado + prova social |
| `src/components/HeroGroupsPreview.tsx` | **Novo** - Preview de grupos ativos |
| `src/pages/Index.tsx` | Adicionar HeroGroupsPreview + HowItWorks |

## Risco

Baixo. Todas as alteracoes sao aditivas e utilizam dados ja disponiveis (hero stats, grupos publicos). Nenhuma mudanca em banco de dados necessaria.

