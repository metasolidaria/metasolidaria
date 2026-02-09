-- 1. Atualizar política de member_commitments para incluir admins
DROP POLICY IF EXISTS "Users can view commitments for accessible groups" ON member_commitments;

CREATE POLICY "Users can view commitments for accessible groups" 
ON member_commitments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.id = member_commitments.member_id
    AND (
      g.is_private = false 
      OR g.leader_id = auth.uid() 
      OR is_group_member(auth.uid(), g.id)
      OR is_admin(auth.uid())
    )
  )
);

-- 2. Atualizar política de goal_progress para incluir admins
DROP POLICY IF EXISTS "Authenticated users can view progress for accessible groups" ON goal_progress;

CREATE POLICY "Authenticated users can view progress for accessible groups"
ON goal_progress FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = goal_progress.group_id
      AND (
        groups.is_private = false 
        OR groups.leader_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.group_id = groups.id 
          AND group_members.user_id = auth.uid()
        )
        OR is_admin(auth.uid())
      )
    )
  )
);