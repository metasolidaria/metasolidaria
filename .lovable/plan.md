
# Plano: Remover Pop-up de Teste

## Objetivo
Remover completamente o modal de anúncio de testes que aparece ao carregar a página inicial.

---

## Mudanças

### Arquivo: `src/pages/Index.tsx`

1. **Remover a importação** do `LaunchAnnouncementModal` (linha 17)
2. **Remover o componente** `<LaunchAnnouncementModal />` do JSX (linhas 109-111)

---

## Resultado
O pop-up não aparecerá mais quando os usuários acessarem o site.

---

## Detalhes Técnicos

```
Antes:
├── Index.tsx
│   ├── import LaunchAnnouncementModal ← remover
│   └── <LaunchAnnouncementModal /> ← remover

Depois:
├── Index.tsx
│   └── (sem modal de anúncio)
```

**Nota:** O arquivo `src/components/LaunchAnnouncementModal.tsx` será mantido no projeto caso você queira reativar o modal futuramente.
