
# Plano: Sistema de Notificações Push para Líderes de Grupos

## Objetivo
Implementar um sistema de notificações push que alerte os líderes de grupos sobre eventos importantes como novas solicitações de entrada, doações registradas e novos membros. O sistema funcionará tanto no app nativo (Android/iOS via Capacitor) quanto no navegador (PWA via Web Push).

---

## Arquitetura da Solução

O sistema será composto por 4 partes principais:

1. **Tabela de tokens de dispositivo** - Armazena os tokens de push de cada usuário
2. **Edge function para enviar notificações** - Processa e envia as notificações
3. **Database triggers** - Detectam eventos e chamam a edge function
4. **Código frontend** - Registra dispositivos e solicita permissão

---

## Eventos que Dispararão Notificações

| Evento | Tabela | Gatilho | Notificação |
|--------|--------|---------|-------------|
| Nova solicitação de entrada | `group_join_requests` | INSERT | "João solicitou entrada no grupo X" |
| Nova doação registrada | `goal_progress` | INSERT | "Maria registrou 5kg de alimentos no grupo X" |
| Novo membro entrou | `group_members` | INSERT | "Pedro entrou no grupo X" |

---

## Etapas de Implementação

### Etapa 1: Infraestrutura do Banco de Dados

**1.1 Criar tabela `push_subscriptions`**
```text
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- endpoint: text (URL do push service)
- p256dh: text (chave pública)
- auth: text (chave de autenticação)
- platform: text ('web' | 'android' | 'ios')
- device_token: text (para FCM/APNs)
- created_at: timestamp
- updated_at: timestamp
```

**1.2 Criar tabela `notification_preferences`**
```text
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- join_requests: boolean (default: true)
- new_donations: boolean (default: true)
- new_members: boolean (default: true)
- created_at: timestamp
```

**1.3 Políticas RLS**
- Usuários podem gerenciar apenas suas próprias inscrições
- Usuários podem ver/editar apenas suas preferências

### Etapa 2: Edge Function para Envio de Notificações

**2.1 Criar `supabase/functions/send-push-notification/index.ts`**

Funcionalidades:
- Receber evento (tipo, group_id, actor_name, details)
- Buscar líder do grupo
- Verificar preferências de notificação do líder
- Buscar tokens de dispositivo do líder
- Enviar notificação via Web Push API e/ou FCM

**2.2 Dependências necessárias**
- `web-push` para Web Push API
- Integração com Firebase Cloud Messaging (FCM) para Android/iOS

### Etapa 3: Database Triggers

**3.1 Trigger para `group_join_requests`**
```text
Após INSERT:
- Buscar group_id e user_name
- Chamar edge function com tipo 'join_request'
```

**3.2 Trigger para `goal_progress`**
```text
Após INSERT:
- Buscar group_id, member_name, amount
- Chamar edge function com tipo 'new_donation'
```

**3.3 Trigger para `group_members`**
```text
Após INSERT:
- Verificar se não é o líder
- Chamar edge function com tipo 'new_member'
```

### Etapa 4: Frontend - Registro de Dispositivos

**4.1 Criar hook `usePushNotifications.tsx`**
- Solicitar permissão do usuário
- Registrar service worker (PWA)
- Obter token do dispositivo
- Salvar na tabela `push_subscriptions`

**4.2 Capacitor Push Notifications Plugin**
- Instalar `@capacitor/push-notifications`
- Configurar para Android (FCM) e iOS (APNs)

**4.3 Componente de Configuração**
- Adicionar toggle na página de perfil
- Permitir ativar/desativar tipos de notificação

### Etapa 5: Configuração de Serviços Externos

**5.1 Firebase Cloud Messaging (FCM)**
- Necessário para push no Android
- Gerar chave de servidor
- Adicionar como secret: `FCM_SERVER_KEY`

**5.2 VAPID Keys (Web Push)**
- Gerar par de chaves VAPID
- Adicionar como secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

---

## Estrutura de Arquivos

```text
src/
├── hooks/
│   └── usePushNotifications.tsx    # Hook para gerenciar push
├── components/
│   └── NotificationSettings.tsx    # Configurações de notificação
└── pages/
    └── Profile.tsx                  # (atualizar com settings)

supabase/
├── functions/
│   └── send-push-notification/
│       └── index.ts                 # Edge function de envio
└── migrations/
    └── XXX_push_notifications.sql   # Tabelas e triggers
```

---

## Fluxo de Funcionamento

1. **Usuário (líder) acessa o app** → Sistema solicita permissão de notificação
2. **Usuário permite** → Token é salvo na tabela `push_subscriptions`
3. **Evento ocorre** (ex: nova solicitação) → Trigger é acionado
4. **Trigger chama edge function** → Função busca tokens do líder
5. **Edge function envia push** → Notificação aparece no dispositivo

---

## Secrets Necessários

| Nome | Descrição |
|------|-----------|
| `VAPID_PUBLIC_KEY` | Chave pública para Web Push |
| `VAPID_PRIVATE_KEY` | Chave privada para Web Push |
| `FCM_SERVER_KEY` | Chave do Firebase Cloud Messaging |

---

## Considerações de Segurança

- Tokens são armazenados apenas para o próprio usuário (RLS)
- Edge function valida que apenas eventos legítimos disparam notificações
- Preferências respeitam a vontade do usuário
- Não expõe dados sensíveis nas notificações

---

## Próximos Passos Após Implementação

1. Testar fluxo completo em ambiente de desenvolvimento
2. Configurar Firebase Console para Android
3. Configurar APNs para iOS (requer conta Apple Developer)
4. Adicionar página de configurações de notificação no perfil
