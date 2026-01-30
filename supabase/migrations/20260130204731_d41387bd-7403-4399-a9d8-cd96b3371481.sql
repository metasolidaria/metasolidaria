-- Drop the old get_admin_groups function with CASCADE to also drop dependent views
DROP FUNCTION IF EXISTS public.get_admin_groups() CASCADE;

-- Recreate get_admin_groups function with members_visible
CREATE FUNCTION public.get_admin_groups()
RETURNS TABLE(
  id uuid,
  name text,
  city text,
  donation_type text,
  goal_2026 integer,
  is_private boolean,
  leader_id uuid,
  leader_name text,
  leader_whatsapp text,
  leader_email character varying,
  description text,
  entity_id uuid,
  image_url text,
  end_date date,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  member_count bigint,
  total_donations bigint,
  total_goals bigint,
  view_count integer,
  members_visible boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    g.id,
    g.name,
    g.city,
    g.donation_type,
    g.goal_2026,
    g.is_private,
    g.leader_id,
    g.leader_name,
    g.leader_whatsapp,
    u.email as leader_email,
    g.description,
    g.entity_id,
    g.image_url,
    g.end_date,
    g.created_at,
    g.updated_at,
    COALESCE(gs.member_count, 0) as member_count,
    COALESCE(gs.total_donations, 0) as total_donations,
    COALESCE(gs.total_goals, 0) as total_goals,
    g.view_count,
    g.members_visible
  FROM public.groups g
  LEFT JOIN public.group_stats gs ON gs.group_id = g.id
  LEFT JOIN auth.users u ON u.id = g.leader_id
  WHERE public.is_admin(auth.uid())
  ORDER BY g.created_at DESC;
$function$;

-- Recreate groups_admin view
DROP VIEW IF EXISTS public.groups_admin;
CREATE VIEW public.groups_admin AS
SELECT 
  g.id,
  g.name,
  g.city,
  g.donation_type,
  g.goal_2026,
  g.is_private,
  g.leader_id,
  g.leader_name,
  g.leader_whatsapp,
  u.email as leader_email,
  g.description,
  g.entity_id,
  g.image_url,
  g.end_date,
  g.created_at,
  g.updated_at,
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_donations, 0) as total_donations,
  COALESCE(gs.total_goals, 0) as total_goals,
  g.view_count,
  g.members_visible
FROM public.groups g
LEFT JOIN public.group_stats gs ON gs.group_id = g.id
LEFT JOIN auth.users u ON u.id = g.leader_id;

-- Recreate groups_public view
DROP VIEW IF EXISTS public.groups_public;
CREATE VIEW public.groups_public AS
SELECT 
  g.id,
  g.name,
  g.city,
  g.donation_type,
  g.goal_2026,
  g.is_private,
  g.leader_id,
  g.leader_name,
  g.description,
  g.entity_id,
  g.image_url,
  g.end_date,
  g.created_at,
  g.updated_at,
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_donations, 0) as total_donations,
  COALESCE(gs.total_goals, 0) as total_goals,
  g.view_count,
  g.members_visible
FROM public.groups g
LEFT JOIN public.group_stats gs ON gs.group_id = g.id
WHERE g.is_private = false;

-- Update create_group_with_leader to accept members_visible parameter
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
  _members_visible boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _group_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO groups (name, city, donation_type, goal_2026, leader_id, is_private, leader_name, leader_whatsapp, description, end_date, entity_id, members_visible)
  VALUES (_name, _city, _donation_type, _goal_2026, _user_id, _is_private, _leader_name, _leader_whatsapp, _description, _end_date, _entity_id, _members_visible)
  RETURNING id INTO _group_id;

  INSERT INTO group_members (group_id, user_id, name, personal_goal)
  VALUES (_group_id, _user_id, COALESCE(_leader_name, 'Líder'), 0);

  RETURN _group_id;
END;
$function$;