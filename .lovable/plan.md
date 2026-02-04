
# Plano: Atualizar Modal de Anúncio

## Objetivo
Alterar o pop-up inicial para mostrar que o app/site está em fase de testes, removendo a data de lançamento específica.

---

## Mudanças

### Arquivo: `src/components/LaunchAnnouncementModal.tsx`

| Elemento | Antes | Depois |
|----------|-------|--------|
| Título | "LANÇAMENTO OFICIAL" | "EM FASE DE TESTES" |
| Destaque | "07/02/2026" | "App/Site em Teste" |
| Descrição | "Estamos chegando! Prepare-se..." | "Breve lançamento! Estamos finalizando..." |

---

## Resultado Visual

```text
┌─────────────────────────────────────┐
│           [Logo Meta Solidária]     │
│                                     │
│        EM FASE DE TESTES            │
│                                     │
│        App/Site em Teste            │
│                                     │
│   Breve lançamento! Estamos         │
│   finalizando os últimos ajustes    │
│   para você fazer parte da maior    │
│   rede de solidariedade do Brasil.  │
│                                     │
│           [Mascote]                 │
│                                     │
│         [ Entendi! ]                │
└─────────────────────────────────────┘
```

---

## Detalhes Técnicos

Alterações no arquivo `src/components/LaunchAnnouncementModal.tsx`:

1. **Linha 27-29**: Alterar `DialogTitle` de "LANÇAMENTO OFICIAL" para "EM FASE DE TESTES"

2. **Linha 30-32**: Alterar o texto destacado de "07/02/2026" para "App/Site em Teste" (pode reduzir o tamanho da fonte de `text-4xl` para `text-2xl` para melhor legibilidade)

3. **Linha 33-36**: Atualizar `DialogDescription` para refletir a mensagem de que está em testes e o lançamento virá em breve
