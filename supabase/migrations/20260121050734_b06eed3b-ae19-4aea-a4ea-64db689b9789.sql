-- Criar função SECURITY DEFINER para criar grupo com líder automaticamente
CREATE OR REPLACE FUNCTION public.create_group_with_leader(
  _name text,
  _city text,
  _donation_type text,
  _goal_2026 integer,
  _is_private boolean,
  _leader_name text,
  _leader_whatsapp text,
  _description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Inserir o grupo
  INSERT INTO groups (name, city, donation_type, goal_2026, leader_id, is_private, leader_name, leader_whatsapp, description)
  VALUES (_name, _city, _donation_type, _goal_2026, _user_id, _is_private, _leader_name, _leader_whatsapp, _description)
  RETURNING id INTO _group_id;

  -- Adicionar o líder como membro automaticamente
  INSERT INTO group_members (group_id, user_id, name, personal_goal)
  VALUES (_group_id, _user_id, COALESCE(_leader_name, 'Líder'), 0);

  RETURN _group_id;
END;
$$;

-- Corrigir grupos existentes: adicionar líderes faltantes como membros
INSERT INTO group_members (group_id, user_id, name, personal_goal)
SELECT g.id, g.leader_id, COALESCE(g.leader_name, 'Líder'), 0
FROM groups g
WHERE NOT EXISTS (
  SELECT 1 FROM group_members gm 
  WHERE gm.group_id = g.id AND gm.user_id = g.leader_id
);