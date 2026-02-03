
# Plano: Popup de Lançamento Oficial em 07/02

## Objetivo
Criar um popup que aparece ao abrir o site/app informando sobre o lançamento oficial em 07 de fevereiro.

## Implementação

### 1. Criar componente `LaunchAnnouncementModal.tsx`

Novo arquivo em `src/components/LaunchAnnouncementModal.tsx`:

- Utilizar o componente `Dialog` do Radix UI (já existente no projeto)
- Exibir data do lançamento: **07/02**
- Design atrativo com ícone de foguete ou confete
- Botão para fechar o modal
- Salvar no `localStorage` para não mostrar novamente após o usuário fechar

### 2. Estrutura do Modal

```text
┌─────────────────────────────────────┐
│              🚀                     │
│                                     │
│     LANÇAMENTO OFICIAL              │
│                                     │
│         07/02/2025                  │
│                                     │
│   Estamos chegando! Prepare-se      │
│   para fazer parte da maior rede    │
│   de solidariedade do Brasil.       │
│                                     │
│        [ Entendi! ]                 │
└─────────────────────────────────────┘
```

### 3. Lógica de exibição

- Verificar `localStorage` na inicialização
- Se `launch-announcement-seen` não existir, mostrar o modal
- Ao fechar, salvar `launch-announcement-seen = true` no `localStorage`

### 4. Integrar no Index.tsx

- Importar com lazy loading para não impactar performance
- Adicionar ao componente Index junto com os outros modais

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/LaunchAnnouncementModal.tsx` | Criar |
| `src/pages/Index.tsx` | Modificar (adicionar o componente) |

## Detalhes Técnicos

```typescript
// Constante para localStorage
const LAUNCH_SEEN_KEY = 'launch-announcement-seen';

// Verificação inicial
useEffect(() => {
  if (!localStorage.getItem(LAUNCH_SEEN_KEY)) {
    setIsOpen(true);
  }
}, []);

// Ao fechar
const handleClose = () => {
  localStorage.setItem(LAUNCH_SEEN_KEY, 'true');
  setIsOpen(false);
};
```
