
# Plano: Corrigir Prompt de Instalação PWA no iOS/Safari

## Problema Identificado

No iPhone/Safari, o prompt de instalação do PWA não aparece. Isso acontece porque:

1. O Safari **não suporta** o evento `beforeinstallprompt` que é usado para detectar se o app pode ser instalado
2. Por isso, `isInstallable` permanece `false` no iOS
3. A lógica atual depende dessa flag para decidir se mostra o prompt

### Fluxo Atual (Problemático)

```text
+-------------------+     +------------------+     +-------------------+
| iOS/Safari        | --> | beforeinstall    | --> | isInstallable     |
| acessa o site     |     | prompt NUNCA     |     | = false           |
+-------------------+     | dispara          |     +-------------------+
                          +------------------+               |
                                                             v
                          +------------------+     +-------------------+
                          | Prompt NÃO       | <-- | shouldShowManual  |
                          | aparece          |     | = true, MAS...    |
                          +------------------+     +-------------------+
                                                             |
                          O problema: o prompt não renderiza porque a
                          condição principal `if (isInstalled || isDismissed)`
                          bloqueia a renderização quando isDismissed = true
                          (valor inicial padrão)
```

### Causa Raiz

O estado `isDismissed` inicia como `true` (linha 23) e só muda para `false` após o `useEffect` rodar. Porém, a lógica do `useEffect` só considera o `localStorage`, não considera que dispositivos iOS precisam de tratamento especial.

---

## Solucao

Modificar a lógica para detectar iOS/Safari e garantir que o prompt com instruções manuais apareça para esses usuários.

---

## Etapas de Implementacao

### Etapa 1: Adicionar detecção de iOS no hook

Modificar `usePWAInstall.tsx` para expor uma flag `isIOSDevice`:

```typescript
const [isIOSDevice, setIsIOSDevice] = useState(false);

useEffect(() => {
  // Detectar iOS
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
              !(window as any).MSStream;
  setIsIOSDevice(iOS);
  
  // ... resto do código
}, []);

return {
  isInstallable,
  isInstalled,
  isIOSDevice, // Nova flag
  installApp,
};
```

### Etapa 2: Ajustar lógica de renderização no componente

Modificar `InstallPWAPrompt.tsx` para considerar iOS na decisão de mostrar o prompt:

```typescript
const { isInstallable, isInstalled, isIOSDevice, installApp } = usePWAInstall();

// Mudança na condição de renderização
// No iOS, não depende de isInstallable porque nunca será true
const shouldRender = !isInstalled && !isDismissed && (isInstallable || isIOSDevice);

if (!shouldRender) {
  return null;
}
```

### Etapa 3: Simplificar lógica de instruções manuais

Atualizar a variável `shouldShowManual` para ser mais clara:

```typescript
// Mostrar instruções manuais quando:
// - É iOS (sempre precisa de instruções manuais)
// - Ou não tem prompt nativo disponível
// - Ou usuário clicou em instalar e falhou
const shouldShowManual = isIOSDevice || !isInstallable || showManualInstructions;
```

---

## Arquivos Afetados

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/usePWAInstall.tsx` | Adicionar deteccao e exposicao de `isIOSDevice` |
| `src/components/InstallPWAPrompt.tsx` | Ajustar logica de renderizacao para considerar iOS |

---

## Resultado Esperado

- Usuarios de iPhone/Safari verao o prompt com instrucoes: "Toque em Compartilhar e depois em Adicionar a Tela Inicial"
- Usuarios de Android continuarao vendo o botao "Instalar App" quando disponivel
- A logica de "dismiss" por 7 dias continuara funcionando normalmente
- O prompt ainda sera exibido 3 segundos apos o carregamento da pagina (comportamento mantido)
