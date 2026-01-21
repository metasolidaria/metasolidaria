-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view members of accessible groups" ON public.group_members;

-- Create a more restrictive policy:
-- 1. For public groups: only authenticated users can see members
-- 2. For private groups: only the leader or members can see other members
CREATE POLICY "Users can view members of accessible groups"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND (
      -- For public groups, require authentication to see members
      (groups.is_private = false AND auth.uid() IS NOT NULL)
      -- For private groups, only leader or members can see
      OR groups.leader_id = auth.uid()
      OR public.is_group_member(auth.uid(), groups.id)
    )
  )
);