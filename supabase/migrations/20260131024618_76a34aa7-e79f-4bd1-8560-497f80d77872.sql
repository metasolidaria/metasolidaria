-- Adicionar campos de meta padrão na tabela groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_name text;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_metric text;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_ratio integer DEFAULT 1;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_donation integer DEFAULT 1;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_commitment_goal integer DEFAULT 0;

-- Função para aplicar meta padrão ao membro
CREATE OR REPLACE FUNCTION apply_default_commitment(_member_id uuid, _group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _group record;
BEGIN
  -- Buscar configuração de meta padrão do grupo
  SELECT 
    default_commitment_name,
    default_commitment_metric,
    default_commitment_ratio,
    default_commitment_donation,
    default_commitment_goal
  INTO _group
  FROM groups
  WHERE id = _group_id;

  -- Se tem métrica definida, criar commitment
  IF _group.default_commitment_metric IS NOT NULL 
     AND _group.default_commitment_metric != '' THEN
    INSERT INTO member_commitments (
      member_id,
      name,
      metric,
      ratio,
      donation_amount,
      personal_goal
    ) VALUES (
      _member_id,
      COALESCE(_group.default_commitment_name, 'Meta de ' || _group.default_commitment_metric),
      _group.default_commitment_metric,
      COALESCE(_group.default_commitment_ratio, 1),
      COALESCE(_group.default_commitment_donation, 1),
      COALESCE(_group.default_commitment_goal, 0)
    );
  END IF;
END;
$$;

-- Atualizar create_group_with_leader para incluir campos de meta padrão e aplicar ao líder
CREATE OR REPLACE FUNCTION public.create_group_with_leader(
  _name text, 
  _city text, 
  _donation_type text, 
  _goal_2026 integer, 
  _is_private boolean, 
  _leader_name text, 
  _leader_whatsapp text, 
  _description text, 
  _end_date date DEFAULT '2026-12-31'::date, 
  _entity_id uuid DEFAULT NULL::uuid, 
  _members_visible boolean DEFAULT true,
  _default_commitment_name text DEFAULT NULL,
  _default_commitment_metric text DEFAULT NULL,
  _default_commitment_ratio integer DEFAULT 1,
  _default_commitment_donation integer DEFAULT 1,
  _default_commitment_goal integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _group_id uuid;
  _member_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO groups (
    name, city, donation_type, goal_2026, leader_id, is_private, 
    leader_name, leader_whatsapp, description, end_date, entity_id, members_visible,
    default_commitment_name, default_commitment_metric, default_commitment_ratio,
    default_commitment_donation, default_commitment_goal
  )
  VALUES (
    _name, _city, _donation_type, _goal_2026, _user_id, _is_private, 
    _leader_name, _leader_whatsapp, _description, _end_date, _entity_id, _members_visible,
    _default_commitment_name, _default_commitment_metric, _default_commitment_ratio,
    _default_commitment_donation, _default_commitment_goal
  )
  RETURNING id INTO _group_id;

  INSERT INTO group_members (group_id, user_id, name, personal_goal)
  VALUES (_group_id, _user_id, COALESCE(_leader_name, 'Líder'), 0)
  RETURNING id INTO _member_id;

  -- Aplicar meta padrão ao líder
  PERFORM apply_default_commitment(_member_id, _group_id);

  RETURN _group_id;
END;
$$;

-- Atualizar accept_link_invitation para aplicar meta padrão
CREATE OR REPLACE FUNCTION public.accept_link_invitation(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _invitation record;
  _new_member_id uuid;
  _user_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Find the invitation (link type only, must be pending and not expired)
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

  -- NOTE: For link-type invitations, we do NOT update status to 'accepted'
  -- This allows multiple people to use the same invite link until it expires

  -- Add user to group
  INSERT INTO group_members (group_id, user_id, name)
  VALUES (_invitation.group_id, auth.uid(), COALESCE(_user_name, 'Membro'))
  RETURNING id INTO _new_member_id;

  -- Aplicar meta padrão ao novo membro
  PERFORM apply_default_commitment(_new_member_id, _invitation.group_id);

  RETURN _new_member_id;
END;
$$;

-- Atualizar accept_group_invitation para aplicar meta padrão
CREATE OR REPLACE FUNCTION public.accept_group_invitation(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _invitation record;
  _new_member_id uuid;
  _user_email text;
  _user_name text;
BEGIN
  -- Get current user's email
  SELECT email INTO _user_email FROM auth.users WHERE id = auth.uid();
  
  IF _user_email IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Find the invitation (bypasses RLS due to SECURITY DEFINER)
  SELECT * INTO _invitation
  FROM group_invitations
  WHERE invite_code = _invite_code
    AND status = 'pending'
    AND expires_at > now();

  IF _invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation not found or expired';
  END IF;

  -- Verify the email matches (case-insensitive)
  IF lower(_invitation.email) != lower(_user_email) THEN
    RAISE EXCEPTION 'Invitation is for a different email address';
  END IF;

  -- Check if user is already a member
  IF EXISTS (SELECT 1 FROM group_members WHERE group_id = _invitation.group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'User is already a member of this group';
  END IF;

  -- Get user name
  SELECT COALESCE(raw_user_meta_data->>'full_name', _user_email) INTO _user_name 
  FROM auth.users WHERE id = auth.uid();

  -- Update invitation status
  UPDATE group_invitations
  SET status = 'accepted'
  WHERE id = _invitation.id;

  -- Add user to group
  INSERT INTO group_members (group_id, user_id, name)
  VALUES (_invitation.group_id, auth.uid(), _user_name)
  RETURNING id INTO _new_member_id;

  -- Aplicar meta padrão ao novo membro
  PERFORM apply_default_commitment(_new_member_id, _invitation.group_id);

  RETURN _new_member_id;
END;
$$;

-- Atualizar approve_join_request para aplicar meta padrão
CREATE OR REPLACE FUNCTION public.approve_join_request(_request_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _request record;
  _new_member_id uuid;
BEGIN
  -- Verificar se é líder do grupo
  SELECT r.*, g.leader_id
  INTO _request
  FROM group_join_requests r
  JOIN groups g ON g.id = r.group_id
  WHERE r.id = _request_id
  AND r.status = 'pending';

  IF _request IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada ou já processada';
  END IF;

  IF _request.leader_id != auth.uid() THEN
    RAISE EXCEPTION 'Apenas o líder pode aprovar solicitações';
  END IF;

  -- Verificar se usuário já é membro
  IF EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = _request.group_id 
    AND user_id = _request.user_id
  ) THEN
    -- Apenas marcar como aprovado, usuário já é membro
    UPDATE group_join_requests
    SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    WHERE id = _request_id;
    
    RETURN NULL;
  END IF;

  -- Atualizar status da solicitação
  UPDATE group_join_requests
  SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;

  -- Adicionar usuário como membro
  INSERT INTO group_members (group_id, user_id, name)
  VALUES (_request.group_id, _request.user_id, _request.user_name)
  RETURNING id INTO _new_member_id;

  -- Aplicar meta padrão ao novo membro
  PERFORM apply_default_commitment(_new_member_id, _request.group_id);

  RETURN _new_member_id;
END;
$$;