-- Tornar email opcional para permitir convites por link
ALTER TABLE public.group_invitations ALTER COLUMN email DROP NOT NULL;

-- Adicionar tipo de convite para diferenciar email vs link
ALTER TABLE public.group_invitations ADD COLUMN IF NOT EXISTS invite_type text DEFAULT 'email';

-- Atualizar política para permitir aceitar convites por link (sem verificação de email)
DROP POLICY IF EXISTS "Users can view their own pending invitations" ON public.group_invitations;

-- Política para convites por email (verificação de email)
CREATE POLICY "Users can view their email invitations" 
  ON public.group_invitations 
  FOR SELECT 
  USING (
    invite_type = 'email'
    AND public.is_current_user_email(email)
    AND status = 'pending'
    AND expires_at > now()
  );

-- Política para convites por link (qualquer usuário autenticado pode ver convites por link pendentes do grupo que está acessando)
CREATE POLICY "Users can view link invitations by code" 
  ON public.group_invitations 
  FOR SELECT 
  USING (
    invite_type = 'link'
    AND status = 'pending'
    AND expires_at > now()
    AND auth.uid() IS NOT NULL
  );

-- Criar função para aceitar convite por link (sem verificação de email)
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
  -- Get current user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Find the invitation (bypasses RLS due to SECURITY DEFINER)
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

  -- Get user name from profile or auth
  SELECT COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email)
  INTO _user_name 
  FROM auth.users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = auth.uid();

  -- Update invitation status
  UPDATE group_invitations
  SET status = 'accepted'
  WHERE id = _invitation.id;

  -- Add user to group
  INSERT INTO group_members (group_id, user_id, name)
  VALUES (_invitation.group_id, auth.uid(), COALESCE(_user_name, 'Membro'))
  RETURNING id INTO _new_member_id;

  RETURN _new_member_id;
END;
$function$;