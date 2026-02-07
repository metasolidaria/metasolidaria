-- Adicionar coluna para controlar visibilidade do WhatsApp no grupo
ALTER TABLE public.groups 
ADD COLUMN whatsapp_visible boolean NOT NULL DEFAULT true;

-- Comentário documentando a funcionalidade
COMMENT ON COLUMN public.groups.whatsapp_visible IS 'Se true, membros podem ver o WhatsApp de outros membros. Se false, apenas o líder e o próprio membro podem ver.';

-- Criar view pública de membros que respeita a configuração de visibilidade
CREATE OR REPLACE VIEW public.group_members_public
WITH (security_invoker=on) AS
SELECT 
  gm.id,
  gm.group_id,
  gm.user_id,
  gm.name,
  gm.personal_goal,
  gm.goals_reached,
  gm.commitment_type,
  gm.commitment_metric,
  gm.commitment_ratio,
  gm.commitment_donation,
  gm.penalty_donation,
  gm.created_at,
  gm.updated_at,
  -- WhatsApp só é visível se:
  -- 1. O grupo permite (whatsapp_visible = true), OU
  -- 2. É o próprio membro, OU
  -- 3. É o líder do grupo, OU
  -- 4. É admin
  CASE 
    WHEN g.whatsapp_visible = true THEN gm.whatsapp
    WHEN gm.user_id = auth.uid() THEN gm.whatsapp
    WHEN g.leader_id = auth.uid() THEN gm.whatsapp
    WHEN public.is_admin(auth.uid()) THEN gm.whatsapp
    ELSE NULL
  END as whatsapp
FROM public.group_members gm
JOIN public.groups g ON g.id = gm.group_id;

-- Atualizar função create_group_with_leader para incluir whatsapp_visible
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
  _entity_id uuid DEFAULT NULL,
  _members_visible boolean DEFAULT true,
  _default_commitment_name text DEFAULT NULL,
  _default_commitment_metric text DEFAULT NULL,
  _default_commitment_ratio integer DEFAULT 1,
  _default_commitment_donation integer DEFAULT 1,
  _default_commitment_goal integer DEFAULT 0,
  _whatsapp_visible boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    default_commitment_donation, default_commitment_goal, whatsapp_visible
  )
  VALUES (
    _name, _city, _donation_type, _goal_2026, _user_id, _is_private, 
    _leader_name, _leader_whatsapp, _description, _end_date, _entity_id, _members_visible,
    _default_commitment_name, _default_commitment_metric, _default_commitment_ratio,
    _default_commitment_donation, _default_commitment_goal, _whatsapp_visible
  )
  RETURNING id INTO _group_id;

  INSERT INTO group_members (group_id, user_id, name, personal_goal)
  VALUES (_group_id, _user_id, COALESCE(_leader_name, 'Líder'), 0)
  RETURNING id INTO _member_id;

  PERFORM apply_default_commitment(_member_id, _group_id);

  RETURN _group_id;
END;
$$;