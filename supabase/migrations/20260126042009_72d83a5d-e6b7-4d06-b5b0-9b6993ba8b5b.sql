-- Fix 1: Strengthen profiles RLS policy to explicitly deny anonymous access
-- Current policy only allows authenticated users to view their own profile
-- Add explicit denial for anonymous users by restricting to authenticated role

-- Drop existing policy and recreate with explicit authenticated role restriction
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;

-- Recreate with explicit authenticated role
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Strengthen group_invitations RLS to prevent email harvesting
-- Current policies only allow leaders to view invitations
-- Add protection by ensuring only authenticated users can access
-- Also ensure the invite_code lookup happens via the SECURITY DEFINER function only

-- Update existing SELECT policy to be more explicit about role
DROP POLICY IF EXISTS "Leaders can view group invitations" ON public.group_invitations;

CREATE POLICY "Leaders can view group invitations"
ON public.group_invitations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);

-- Add a policy for users to view their own pending invitations
-- This allows users to see invitations sent to their email
CREATE POLICY "Users can view their own pending invitations"
ON public.group_invitations
FOR SELECT
TO authenticated
USING (
  lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  AND status = 'pending'
  AND expires_at > now()
);

-- Also update INSERT policy to be explicit about authenticated role
DROP POLICY IF EXISTS "Leaders can create invitations" ON public.group_invitations;

CREATE POLICY "Leaders can create invitations"
ON public.group_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);

-- Update UPDATE policy to be explicit about authenticated role
DROP POLICY IF EXISTS "Leaders can update invitations" ON public.group_invitations;

CREATE POLICY "Leaders can update invitations"
ON public.group_invitations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);

-- Update DELETE policy to be explicit about authenticated role
DROP POLICY IF EXISTS "Leaders can delete invitations" ON public.group_invitations;

CREATE POLICY "Leaders can delete invitations"
ON public.group_invitations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);