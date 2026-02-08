-- Drop all overloaded versions of create_group_with_leader
DROP FUNCTION IF EXISTS public.create_group_with_leader(text, text, text, integer, boolean, text, text, text);
DROP FUNCTION IF EXISTS public.create_group_with_leader(text, text, text, integer, boolean, text, text, text, date);
DROP FUNCTION IF EXISTS public.create_group_with_leader(text, text, text, integer, boolean, text, text, text, date, uuid);
DROP FUNCTION IF EXISTS public.create_group_with_leader(text, text, text, integer, boolean, text, text, text, date, uuid, boolean);
DROP FUNCTION IF EXISTS public.create_group_with_leader(text, text, text, integer, boolean, text, text, text, date, uuid, boolean, text, text, integer, integer, integer);
DROP FUNCTION IF EXISTS public.create_group_with_leader(text, text, text, integer, boolean, text, text, text, date, uuid, boolean, text, text, integer, integer, integer, boolean);

-- Recreate the single unified version with all parameters
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