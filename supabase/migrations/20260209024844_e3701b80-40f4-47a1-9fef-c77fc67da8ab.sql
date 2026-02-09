-- Atualizar política RLS de SELECT na tabela groups para incluir administradores
DROP POLICY IF EXISTS "Authenticated users can view accessible groups" ON groups;

CREATE POLICY "Authenticated users can view accessible groups" 
ON groups FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_private = false 
    OR leader_id = auth.uid() 
    OR is_group_member(auth.uid(), id)
    OR is_admin(auth.uid())
  )
);