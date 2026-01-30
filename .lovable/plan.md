

# Plano: Tornar Convites por Link Reutilizáveis

## Resumo
Modificar o sistema de convites para permitir que links de convite possam ser usados por múltiplas pessoas, até a data de expiração (30 dias).

## Comportamento Atual
1. Líder gera link de convite → cria registro com `status = 'pending'`
2. Primeira pessoa usa o link → `status` muda para `'accepted'`
3. Segunda pessoa tenta usar → erro "Convite inválido ou expirado"

## Novo Comportamento
1. Líder gera link de convite → cria registro com `status = 'pending'`
2. Primeira pessoa usa o link → continua `status = 'pending'`
3. Segunda pessoa usa o link → também entra no grupo
4. Link continua válido até expirar (30 dias)

## Mudanças Técnicas

### 1. Atualizar Função RPC `accept_link_invitation`

Remover a linha que atualiza o status para 'accepted' em convites do tipo 'link':

```sql
-- REMOVER esta parte para convites tipo 'link':
UPDATE group_invitations
SET status = 'accepted'
WHERE id = _invitation.id;
```

A função continuará:
- Verificando se o convite existe e não expirou
- Verificando se o usuário já é membro (evita duplicidade)
- Adicionando o usuário ao grupo
- **MAS NÃO** marcará o convite como 'accepted'

### 2. Migração SQL

```sql
CREATE OR REPLACE FUNCTION public.accept_link_invitation(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invitation record;
  _new_member_id uuid;
  _user_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Find the invitation
  SELECT * INTO _invitation
  FROM group_invitations
  WHERE invite_code = _invite_code
    AND invite_type = 'link'
    AND status = 'pending'
    AND expires_at > now();

  IF _invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation not found or expired';
  END IF;

  -- Check if user is already a member
  IF EXISTS (SELECT 1 FROM group_members WHERE group_id = _invitation.group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'User is already a member of this group';
  END IF;

  -- Get user name
  SELECT COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email)
  INTO _user_name 
  FROM auth.users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = auth.uid();

  -- NÃO atualiza status para 'accepted' em convites tipo link
  -- permitindo que múltiplas pessoas usem o mesmo link

  -- Add user to group
  INSERT INTO group_members (group_id, user_id, name)
  VALUES (_invitation.group_id, auth.uid(), COALESCE(_user_name, 'Membro'))
  RETURNING id INTO _new_member_id;

  RETURN _new_member_id;
END;
$function$;
```

## Benefícios
- Líder pode compartilhar um único link em grupos de WhatsApp
- Múltiplas pessoas podem entrar usando o mesmo link
- Link expira automaticamente após 30 dias
- Proteção contra duplicidade (usuário não pode entrar duas vezes)

## Considerações
- Convites por email (`invite_type = 'email'`) continuam sendo de uso único
- O painel de administração mostrará o convite como "pendente" mesmo após pessoas entrarem
- Se desejar, podemos adicionar um contador de quantas pessoas usaram cada link no futuro

