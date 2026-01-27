-- Criar tabela de solicitações de entrada em grupos
CREATE TABLE public.group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  UNIQUE(group_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem criar solicitações para si mesmos
CREATE POLICY "Users can create join requests"
  ON public.group_join_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver suas próprias solicitações
CREATE POLICY "Users can view their own requests"
  ON public.group_join_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Líderes podem ver solicitações dos seus grupos
CREATE POLICY "Leaders can view group requests"
  ON public.group_join_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_join_requests.group_id
      AND groups.leader_id = auth.uid()
    )
  );

-- Líderes podem atualizar (aprovar/rejeitar) solicitações dos seus grupos
CREATE POLICY "Leaders can update group requests"
  ON public.group_join_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_join_requests.group_id
      AND groups.leader_id = auth.uid()
    )
  );

-- Função para aprovar solicitação e adicionar membro
CREATE OR REPLACE FUNCTION public.approve_join_request(_request_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  RETURN _new_member_id;
END;
$function$;

-- Função para rejeitar solicitação
CREATE OR REPLACE FUNCTION public.reject_join_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _request record;
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
    RAISE EXCEPTION 'Apenas o líder pode rejeitar solicitações';
  END IF;

  -- Atualizar status da solicitação
  UPDATE group_join_requests
  SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _request_id;
END;
$function$;