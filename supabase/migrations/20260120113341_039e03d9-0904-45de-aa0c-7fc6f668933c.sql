-- Criar função SECURITY DEFINER para verificar membros sem recursão
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

-- Remover políticas problemáticas da tabela groups
DROP POLICY IF EXISTS "Users can view public groups or private groups they are members" ON groups;

-- Criar nova política para groups usando a função
CREATE POLICY "Users can view accessible groups"
ON groups FOR SELECT
USING (
  is_private = false 
  OR leader_id = auth.uid() 
  OR public.is_group_member(auth.uid(), id)
);

-- Remover política problemática da tabela group_members
DROP POLICY IF EXISTS "Users can view members of accessible groups" ON group_members;

-- Criar nova política para group_members
CREATE POLICY "Users can view members of accessible groups"
ON group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND (
      groups.is_private = false
      OR groups.leader_id = auth.uid()
      OR public.is_group_member(auth.uid(), groups.id)
    )
  )
);