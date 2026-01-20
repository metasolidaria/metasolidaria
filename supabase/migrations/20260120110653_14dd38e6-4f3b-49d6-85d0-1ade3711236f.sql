-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view group members" ON group_members;

-- Create new restrictive policy: only group members, leaders, or members of the same group can view
CREATE POLICY "Users can view members of accessible groups"
ON group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND (
      -- Public groups: anyone authenticated can see members
      (groups.is_private = false AND auth.uid() IS NOT NULL)
      -- Private groups: only leader or members can see
      OR groups.leader_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = groups.id
        AND gm.user_id = auth.uid()
      )
    )
  )
);