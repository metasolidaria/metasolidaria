-- Adicionar coluna whatsapp na tabela group_members para identificar membros por telefone
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS whatsapp text;

-- Criar índice para busca por whatsapp
CREATE INDEX IF NOT EXISTS idx_group_members_whatsapp ON public.group_members(whatsapp);

-- Criar índice único para evitar duplicatas de whatsapp no mesmo grupo
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_members_group_whatsapp 
ON public.group_members(group_id, whatsapp) 
WHERE whatsapp IS NOT NULL AND whatsapp != '';

-- Atualizar a política de INSERT para permitir que líderes adicionem membros
DROP POLICY IF EXISTS "Users can only join groups as themselves" ON public.group_members;
DROP POLICY IF EXISTS "Users can join public groups or private groups with invitation" ON public.group_members;

-- Política para usuários se juntarem a grupos (mantém funcionalidade existente)
CREATE POLICY "Users can join groups as themselves"
ON public.group_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Política para líderes adicionarem membros diretamente (sem user_id, apenas com whatsapp)
CREATE POLICY "Leaders can add members to their groups"
ON public.group_members FOR INSERT
WITH CHECK (
  user_id IS NULL 
  AND EXISTS (
    SELECT 1 FROM groups 
    WHERE groups.id = group_id 
    AND groups.leader_id = auth.uid()
  )
);

-- Política para permitir que usuários "claim" sua membership quando se cadastrarem
CREATE POLICY "Users can claim their membership by whatsapp"
ON public.group_members FOR UPDATE
USING (
  user_id IS NULL 
  AND whatsapp IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id
);

-- Função para linkar membro pelo WhatsApp quando usuário faz login/cadastro
CREATE OR REPLACE FUNCTION public.link_member_by_whatsapp(_whatsapp text)
RETURNS TABLE(group_id uuid, member_id uuid, group_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _normalized_whatsapp text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Normalizar WhatsApp (remover caracteres especiais)
  _normalized_whatsapp := regexp_replace(_whatsapp, '[^0-9]', '', 'g');

  -- Atualizar membros que têm o mesmo WhatsApp e ainda não têm user_id
  RETURN QUERY
  WITH updated AS (
    UPDATE group_members gm
    SET user_id = _user_id, updated_at = now()
    WHERE gm.user_id IS NULL
      AND regexp_replace(gm.whatsapp, '[^0-9]', '', 'g') = _normalized_whatsapp
      AND NOT EXISTS (
        SELECT 1 FROM group_members existing
        WHERE existing.group_id = gm.group_id
        AND existing.user_id = _user_id
      )
    RETURNING gm.group_id, gm.id as member_id
  )
  SELECT u.group_id, u.member_id, g.name as group_name
  FROM updated u
  JOIN groups g ON g.id = u.group_id;
END;
$$;