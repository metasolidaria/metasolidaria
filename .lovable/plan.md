
# Plano: Criar Página de Termos de Uso

## Objetivo
Criar uma página de Termos de Uso (/termos) seguindo o mesmo padrão visual da Política de Privacidade existente, incluindo links no rodapé e no modal de cadastro.

---

## Alterações a Serem Feitas

### 1. Criar nova página `src/pages/TermsOfService.tsx`
Uma página completa com seções sobre:
- **Aceitação dos Termos** - Condições de uso da plataforma
- **Descrição do Serviço** - O que é a Meta Solidária
- **Elegibilidade** - Requisitos para uso (18+ anos, etc.)
- **Cadastro e Conta** - Responsabilidades do usuário
- **Doações** - Natureza voluntária, sem transações financeiras
- **Conteúdo do Usuário** - Responsabilidade sobre informações enviadas
- **Uso Aceitável** - Proibições (spam, fraude, conteúdo ofensivo)
- **Propriedade Intelectual** - Direitos da Meta Solidária
- **Limitação de Responsabilidade** - Isenções legais
- **Alterações nos Termos** - Como serão comunicadas
- **Contato** - WhatsApp e Instagram

### 2. Atualizar `src/App.tsx`
- Importar `TermsOfService` com lazy loading
- Adicionar rota `/termos`

### 3. Atualizar `src/components/Footer.tsx`
- Adicionar link "Termos de Uso" ao lado de "Política de Privacidade"

### 4. Atualizar `src/components/AuthModal.tsx`
- Adicionar link para Termos de Uso no texto de consentimento do cadastro

---

## Estrutura Visual
O design seguirá exatamente o padrão da página de Política de Privacidade:
- Botão "Voltar" no topo
- Título principal
- Seções numeradas com títulos em destaque
- Listas com bullets para itens detalhados
- Rodapé com copyright

---

## Detalhes Técnicos

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/TermsOfService.tsx` | Criar novo arquivo |
| `src/App.tsx` | Adicionar import + rota |
| `src/components/Footer.tsx` | Adicionar link |
| `src/components/AuthModal.tsx` | Atualizar texto de consentimento |

### Rotas
- Nova rota: `/termos` → `TermsOfService`

### Navegação
- Footer: "Política de Privacidade" | "Termos de Uso"
- AuthModal: "...concorda com nossa Política de Privacidade e Termos de Uso"
