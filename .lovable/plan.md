
## Plano: Corrigir Erro do Clipboard no iOS/Safari

### Analise do Problema

O erro exibido na imagem:
```
"The request is not allowed by the user agent or the platform in the current context, 
possibly because the user denied permission."
```

Este e um erro especifico do Safari no iOS relacionado a API de Clipboard. O Safari tem politicas de seguranca mais rigorosas e exige que a escrita no clipboard aconteca **imediatamente** apos a acao do usuario, sem operacoes assincronas intermediarias.

**Causa raiz**: No codigo atual, fazemos uma chamada assincrona ao banco de dados (`createLinkInvitation.mutateAsync`) ANTES de chamar `navigator.clipboard.writeText()`. O Safari perde o "user gesture" original durante essa operacao assincrona e bloqueia o acesso ao clipboard.

### Solucao Proposta

#### Estrategia 1: Usar ClipboardItem com Promise

O Safari aceita um `ClipboardItem` que recebe uma Promise, permitindo resolver o conteudo de forma assincrona:

```typescript
const handleCopyLink = async () => {
  if (!groupId) return;

  try {
    // Verificar se a API moderna esta disponivel
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      // Criar o ClipboardItem ANTES da operacao assincrona
      const clipboardItem = new ClipboardItem({
        'text/plain': (async () => {
          const inviteCode = await createLinkInvitation.mutateAsync(groupId);
          const inviteUrl = `https://metasolidaria.com.br?invite=${inviteCode}`;
          const inviteText = generateInviteText(inviteUrl);
          return new Blob([inviteText], { type: 'text/plain' });
        })()
      });
      
      await navigator.clipboard.write([clipboardItem]);
    } else {
      // Fallback para navegadores mais antigos
      // ... usar execCommand ou outra estrategia
    }
  } catch (error) {
    // ...
  }
};
```

#### Estrategia 2: Fallback com document.execCommand (para iOS mais antigo)

Para dispositivos onde a API de Clipboard nao esta disponivel, usar o metodo legado:

```typescript
const fallbackCopyToClipboard = (text: string): boolean => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
};
```

#### Estrategia 3: Usar Web Share API como alternativa

No iOS, a Web Share API funciona bem e pode ser uma alternativa melhor que copiar para o clipboard:

```typescript
const handleShareNative = async () => {
  if (navigator.share) {
    await navigator.share({
      title: 'Convite para o grupo',
      text: inviteText,
      url: inviteUrl
    });
  }
};
```

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/InviteMemberModal.tsx` | Implementar ClipboardItem com Promise + fallback + opcao de compartilhamento nativo |

### Implementacao Detalhada

A nova funcao `handleCopyLink` tera tres niveis de fallback:

1. **Primeiro**: Tentar usar `ClipboardItem` com Promise (funciona no Safari moderno)
2. **Segundo**: Usar `navigator.clipboard.writeText` com fallback imediato (outros navegadores)
3. **Terceiro**: Usar `document.execCommand('copy')` para navegadores legados

Alem disso, vou adicionar um botao de "Compartilhar" que usa a Web Share API nativa do iOS, oferecendo uma experiencia melhor para usuarios de dispositivos moveis.

### Detalhes Tecnicos

O Safari exige que a escrita no clipboard aconteca dentro do mesmo "user activation" (click event). A solucao com `ClipboardItem` funciona porque passamos uma Promise ao construtor, e o Safari permite resolver essa Promise de forma assincrona enquanto mantem o contexto de ativacao do usuario.

Referencias:
- Apple Developer Forums: ClipboardItem aceita Promise como valor
- MDN Web Docs: Web Share API como alternativa mobile-friendly
