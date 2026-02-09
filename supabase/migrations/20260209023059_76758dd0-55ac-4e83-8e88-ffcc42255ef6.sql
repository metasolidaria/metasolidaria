-- Atualizar política de group_members para que admins possam ver membros de qualquer grupo
-- (necessário para mostrar grupos de usuários na administração)

DROP POLICY IF EXISTS "Users can view members of accessible groups" ON group_members;

CREATE POLICY "Users can view members of accessible groups" 
ON group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND (
      (groups.is_private = false AND auth.uid() IS NOT NULL)
      OR groups.leader_id = auth.uid()
      OR is_group_member(auth.uid(), groups.id)
      OR is_admin(auth.uid())
    )
  )
);