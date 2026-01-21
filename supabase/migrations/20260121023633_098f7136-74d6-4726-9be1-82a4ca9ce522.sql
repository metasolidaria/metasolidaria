-- Drop the existing overly broad ALL policy for leaders
DROP POLICY IF EXISTS "Group leaders can manage invitations" ON public.group_invitations;

-- Create specific policies for each operation

-- Leaders can INSERT invitations for their groups
CREATE POLICY "Leaders can create invitations"
ON public.group_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);

-- Leaders can UPDATE invitations for their groups
CREATE POLICY "Leaders can update invitations"
ON public.group_invitations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);

-- Leaders can DELETE invitations for their groups
CREATE POLICY "Leaders can delete invitations"
ON public.group_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);

-- Restrictive SELECT: Only group leaders OR the invited user can view invitations
-- This replaces the old policy that only checked user's own email
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON public.group_invitations;

CREATE POLICY "Users can view their invitations or leaders can view group invitations"
ON public.group_invitations
FOR SELECT
USING (
  -- User can see invitations sent to their own email
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR
  -- Group leader can see all invitations for their group
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);