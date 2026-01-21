-- Adicionar coluna de data de finalização das metas
ALTER TABLE public.groups 
  ADD COLUMN IF NOT EXISTS end_date date DEFAULT '2026-12-31';

COMMENT ON COLUMN public.groups.end_date IS 'Data limite para cumprimento das metas do grupo';

-- Atualizar função de criação de grupo para incluir data de finalização
CREATE OR REPLACE FUNCTION public.create_group_with_leader(
  _name text,
  _city text,
  _donation_type text,
  _goal_2026 integer,
  _is_private boolean,
  _leader_name text,
  _leader_whatsapp text,
  _description text,
  _end_date date DEFAULT '2026-12-31'
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
  INSERT INTO groups (name, city, donation_type, goal_2026, leader_id, is_private, leader_name, leader_whatsapp, description, end_date)
  VALUES (_name, _city, _donation_type, _goal_2026, _user_id, _is_private, _leader_name, _leader_whatsapp, _description, _end_date)
  RETURNING id INTO _group_id;

  -- Adicionar o líder como membro automaticamente
  INSERT INTO group_members (group_id, user_id, name, personal_goal)
  VALUES (_group_id, _user_id, COALESCE(_leader_name, 'Líder'), 0);

  RETURN _group_id;
END;
$$;