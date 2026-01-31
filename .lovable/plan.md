
# Plano: Configurar Capacitor para Android

## Objetivo
Configurar o Capacitor no projeto Meta Solidária para converter o PWA em um app Android nativo que possa ser publicado na Google Play Store como arquivo `.aab` (Android App Bundle).

---

## O Que Será Feito

### 1. Instalar dependências do Capacitor
Adicionar os pacotes necessários:
- `@capacitor/core` - Núcleo do Capacitor
- `@capacitor/cli` - Ferramenta de linha de comando (devDependency)
- `@capacitor/android` - Plataforma Android

### 2. Criar arquivo de configuração `capacitor.config.ts`
Configuração com:
- **appId**: `app.lovable.48cb3c9479794c0abe1669aa41076de9`
- **appName**: `Meta Solidária`
- **webDir**: `dist` (pasta de build do Vite)
- **server.url**: URL do preview para hot-reload durante desenvolvimento

### 3. Adicionar scripts no `package.json`
Scripts para facilitar o workflow:
- `cap:sync` - Sincronizar projeto web com plataforma nativa
- `cap:open` - Abrir projeto no Android Studio
- `cap:build` - Build + sync em um comando

---

## Passos Para Publicar na Play Store

Após a configuração, você precisará seguir estes passos no seu computador local:

### Passo 1: Exportar o Projeto
1. Clique em **"Export to GitHub"** no Lovable
2. Clone o repositório para sua máquina local
3. Execute `npm install` para instalar dependências

### Passo 2: Adicionar Plataforma Android
```bash
npx cap add android
```

### Passo 3: Sincronizar e Abrir no Android Studio
```bash
npm run build
npx cap sync
npx cap open android
```

### Passo 4: Gerar o AAB (Android App Bundle)
No Android Studio:
1. Menu **Build** > **Generate Signed Bundle / APK**
2. Selecione **Android App Bundle**
3. Crie ou use uma keystore existente
4. Guarde a keystore em local seguro (necessária para updates futuros)
5. Selecione **release** como build variant
6. O arquivo `.aab` será gerado em `android/app/build/outputs/bundle/release/`

### Passo 5: Publicar na Google Play Console
1. Acesse [Google Play Console](https://play.google.com/console)
2. Crie uma conta de desenvolvedor ($25 USD)
3. Crie o app e faça upload do `.aab`
4. Preencha as informações da listagem (textos já preparados)
5. Faça upload dos assets (ícone, screenshots, feature graphic)
6. Complete o questionário de classificação etária
7. Envie para revisão

---

## Requisitos no Seu Computador

| Ferramenta | Descrição |
|------------|-----------|
| Node.js | v18 ou superior |
| Android Studio | Última versão estável |
| JDK | Java Development Kit 17+ |
| Android SDK | API 33+ (instalado via Android Studio) |

---

## Detalhes Técnicos

### Arquivo `capacitor.config.ts`
```text
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.48cb3c9479794c0abe1669aa41076de9',
  appName: 'Meta Solidária',
  webDir: 'dist',
  server: {
    url: 'https://48cb3c94-7979-4c0a-be16-69aa41076de9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
```

### Scripts `package.json`
```text
"scripts": {
  ...
  "cap:sync": "npx cap sync",
  "cap:open": "npx cap open android",
  "cap:build": "npm run build && npx cap sync"
}
```

### Dependências a Instalar
```text
dependencies:
  @capacitor/core: ^7.0.0
  @capacitor/android: ^7.0.0

devDependencies:
  @capacitor/cli: ^7.0.0
```

---

## Notas Importantes

1. **Hot-Reload**: A configuração `server.url` permite testar mudanças em tempo real no dispositivo durante desenvolvimento. Para produção, remova ou comente esta linha.

2. **Keystore**: A chave de assinatura (keystore) é essencial. Se perdida, você não poderá publicar atualizações do app.

3. **Ícones Android**: O Capacitor usa os ícones de `android/app/src/main/res/`. Após adicionar a plataforma, você pode customizá-los.

4. **Documentação**: Para mais detalhes, consulte o [blog post do Lovable sobre desenvolvimento mobile](https://docs.lovable.dev/features/mobile-development).
