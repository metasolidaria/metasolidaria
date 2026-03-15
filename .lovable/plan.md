

## Enviar E-mails de Lembrete para Membros

Sim, e possivel. Para isso precisamos configurar o envio de e-mails no projeto.

### Pre-requisito: Configurar Dominio de E-mail

O projeto ainda nao tem um dominio de e-mail configurado. O primeiro passo e configurar um dominio de envio (ex: `notify@seudominio.com`) para que os e-mails cheguem na caixa de entrada dos membros e nao caiam no spam.

### O que sera implementado

1. **Configurar dominio de e-mail** - Voce precisara de um dominio proprio (ex: metasolidaria.com.br) e configurar os registros DNS
2. **Infraestrutura de e-mail** - Fila de envio com retentativas automaticas, log de entregas
3. **Edge Function de lembrete** - Funcao backend que busca membros com e-mail cadastrado e envia o lembrete
4. **Template do e-mail** - E-mail bonito e responsivo lembrando o membro de registrar suas evolucoes, com link direto para o grupo
5. **Gatilho de envio** - Pode ser manual (botao no painel admin) ou automatico (semanal via cron job)

### Observacao importante

Atualmente os membros sao cadastrados apenas com nome e WhatsApp. Para enviar e-mails, precisariamos do e-mail dos membros. Existem duas opcoes:

- **Usar o e-mail da conta do usuario** (membros que tem `user_id` vinculado ja possuem e-mail no sistema de autenticacao)
- **Adicionar campo de e-mail na tabela de membros** para membros sem conta

### Proximos passos

Para comecar, o primeiro passo e configurar seu dominio de e-mail:

<lov-actions>
<lov-open-email-setup>Configurar dominio de e-mail</lov-open-email-setup>
</lov-actions>

