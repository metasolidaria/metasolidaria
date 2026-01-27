-- Criar função RPC para administradores buscarem todos os convites
CREATE OR REPLACE FUNCTION public.get_admin_invitations()
RETURNS TABLE (
  id uuid,
  group_id uuid,
  group_name text,
  invite_code text,
  invite_type text,
  email text,
  status text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  invited_by uuid,
  invited_by_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    gi.id,
    gi.group_id,
    g.name as group_name,
    gi.invite_code,
    gi.invite_type,
    gi.email,
    gi.status,
    gi.created_at,
    gi.expires_at,
    gi.invited_by,
    COALESCE(p.full_name, 'Desconhecido') as invited_by_name
  FROM group_invitations gi
  JOIN groups g ON g.id = gi.group_id
  LEFT JOIN profiles p ON p.user_id = gi.invited_by
  WHERE public.is_admin(auth.uid())
  ORDER BY gi.created_at DESC;
$$;

-- Criar função para renovar convite (gerar novo código e resetar expiração)
CREATE OR REPLACE FUNCTION public.renew_invitation(_invitation_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem renovar convites';
  END IF;

  UPDATE group_invitations
  SET 
    invite_code = gen_random_uuid()::text,
    expires_at = now() + interval '30 days',
    status = 'pending'
  WHERE id = _invitation_id;

  RETURN _invitation_id;
END;
$$;

-- Criar função para revogar convite
CREATE OR REPLACE FUNCTION public.revoke_invitation(_invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem revogar convites';
  END IF;

  DELETE FROM group_invitations WHERE id = _invitation_id;
END;
$$;

-- Criar view para estatísticas de convites (apenas para admins via RPC)
CREATE OR REPLACE FUNCTION public.get_invitation_stats()
RETURNS TABLE (
  total_invitations bigint,
  pending_invitations bigint,
  accepted_invitations bigint,
  expired_invitations bigint,
  acceptance_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::bigint as total_invitations,
    COUNT(*) FILTER (WHERE status = 'pending' AND expires_at > now())::bigint as pending_invitations,
    COUNT(*) FILTER (WHERE status = 'accepted')::bigint as accepted_invitations,
    COUNT(*) FILTER (WHERE status = 'pending' AND expires_at <= now())::bigint as expired_invitations,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'accepted')::numeric / COUNT(*)::numeric) * 100, 1)
      ELSE 0
    END as acceptance_rate
  FROM group_invitations
  WHERE public.is_admin(auth.uid());
$$;