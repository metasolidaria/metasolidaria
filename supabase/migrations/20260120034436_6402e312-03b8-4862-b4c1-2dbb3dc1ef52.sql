-- Allow group leaders to remove members from their groups
CREATE POLICY "Leaders can remove members from their groups"
ON group_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM groups 
    WHERE groups.id = group_members.group_id 
    AND groups.leader_id = auth.uid()
  )
);