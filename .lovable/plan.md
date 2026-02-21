

## Desativar confirmação de email no cadastro

Atualmente, ao criar uma conta, o usuário precisa confirmar o email antes de conseguir acessar. A mudança fará com que o usuário tenha acesso imediato após o cadastro.

### O que será feito

1. **Configurar auto-confirmação de email** - Alterar a configuração de autenticação para que novos usuários sejam confirmados automaticamente, sem necessidade de clicar em link no email.

2. **Ajustar mensagem no cadastro** - Atualizar o `AuthModal.tsx` para remover a mensagem "Verifique seu email" e sempre mostrar a mensagem de sucesso "Conta criada com sucesso!", já que o usuário terá acesso imediato.

### Detalhes técnicos

- Usar a ferramenta `configure-auth` para habilitar `auto_confirm_email = true`
- No `AuthModal.tsx`, simplificar o bloco pós-signup (linhas 107-118) removendo a verificação `if (signUpData?.user && !signUpData?.session)` e deixando apenas a mensagem de sucesso com fechamento do modal

