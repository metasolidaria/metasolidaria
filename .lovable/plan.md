
# Plano: Persistir Estado de Instalação do PWA no localStorage

## Problema Atual

A detecção de "app instalado" só funciona quando o usuário está **dentro do app** (modo standalone). Quando ele acessa pelo navegador comum depois de já ter instalado, o botão "Baixar App" aparece novamente porque:

- `display-mode: standalone` só é `true` quando abre pelo ícone do app
- `navigator.standalone` (iOS) também só funciona dentro do PWA

## Solução

Salvar no `localStorage` quando o usuário instalar o app com sucesso, para que o botão fique oculto mesmo quando acessar pelo navegador.

## Alterações no `src/hooks/usePWAInstall.tsx`

### 1. Adicionar constante para a chave do localStorage

```typescript
const INSTALLED_KEY = 'pwa-installed';
```

### 2. Verificar localStorage na inicialização

Dentro do `useEffect`, antes de verificar o `display-mode`:

```typescript
// Verificar se já foi instalado anteriormente
if (localStorage.getItem(INSTALLED_KEY) === 'true') {
  setIsInstalled(true);
  return;
}
```

### 3. Salvar no localStorage quando instalar

No `handleAppInstalled` e quando `outcome === 'accepted'`:

```typescript
localStorage.setItem(INSTALLED_KEY, 'true');
```

## Fluxo Atualizado

```text
┌─────────────────────────────────────────────────────────────┐
│                    Usuário abre o site                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │ localStorage tem 'pwa-installed'? │
               └──────────────────────────────┘
                    │                    │
                   Sim                  Não
                    │                    │
                    ▼                    ▼
           isInstalled=true    Verificar display-mode
           (oculta botão)               │
                              ┌─────────┴─────────┐
                             Sim                 Não
                              │                   │
                              ▼                   ▼
                     isInstalled=true     Mostrar botão
                                                  │
                                                  ▼
                                      Usuário clica "Instalar"
                                                  │
                                                  ▼
                                      Salvar 'pwa-installed' = true
                                                  │
                                                  ▼
                                           Ocultar botão
```

## Benefício

Mesmo que o usuário abra o site pelo navegador depois de já ter instalado, o botão "Baixar App" não aparecerá mais.

## Arquivo a Modificar

- `src/hooks/usePWAInstall.tsx`
