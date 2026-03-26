

## Corrigir sobreposição do header com a status bar do Android

### Problema
O header fixo (`fixed top-0`) fica por trás da barra de status do Android quando o app roda como aplicativo nativo (Capacitor). No navegador isso não acontece porque o browser já gerencia a safe area, mas no app nativo o WebView ocupa a tela inteira, incluindo a área da status bar.

### Solução

Duas mudanças simples:

**1. Configurar Capacitor para usar a Status Bar overlay**
- Em `capacitor.config.ts`, adicionar configuração do plugin `StatusBar` com `overlaysWebView: false` para que o WebView não fique atrás da status bar. Isso resolve o problema na maioria dos casos.

**2. Adicionar suporte a safe-area via CSS (fallback)**
- No `index.html`, adicionar `viewport-fit=cover` na meta tag viewport
- No `src/index.css`, adicionar padding-top com `env(safe-area-inset-top)` no body ou no header para respeitar a safe area em dispositivos com notch ou status bar sobreposta
- No `Header.tsx`, ajustar o `top` ou `padding-top` para usar `env(safe-area-inset-top)` garantindo que o conteúdo não fique escondido

### Detalhes técnicos

- `viewport-fit=cover` na meta viewport permite que o CSS acesse `env(safe-area-inset-top)`
- `env(safe-area-inset-top)` retorna a altura da status bar/notch do dispositivo
- O header precisa de `padding-top: env(safe-area-inset-top)` e as páginas precisam compensar a altura extra

### Arquivos alterados
1. `index.html` — adicionar `viewport-fit=cover`
2. `src/index.css` — variável CSS para safe-area
3. `src/components/Header.tsx` — padding-top com safe-area-inset-top
4. `capacitor.config.ts` — configuração do StatusBar plugin

