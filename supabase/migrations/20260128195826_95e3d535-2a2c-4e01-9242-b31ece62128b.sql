-- Fix 1: Restrict access to groups table so that leader_whatsapp is only visible to authenticated members/leaders
-- The groups_public view already excludes leader_whatsapp, but direct table access needs protection

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view accessible groups with privacy" ON public.groups;

-- Create a new policy that requires authentication for viewing any group data
-- This ensures leader_whatsapp cannot be scraped by anonymous users
-- Public groups are visible to authenticated users, leaders and members see their groups
CREATE POLICY "Authenticated users can view accessible groups"
ON public.groups FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    is_private = false OR 
    leader_id = auth.uid() OR 
    is_group_member(auth.uid(), id)
  )
);

-- Fix 2: Restrict goal_progress to require authentication
-- Currently allows viewing progress for public groups without auth, exposing user_id activity data

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view progress for accessible groups" ON public.goal_progress;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view progress for accessible groups"
ON public.goal_progress FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = goal_progress.group_id 
    AND (
      groups.is_private = false OR 
      groups.leader_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = groups.id 
        AND group_members.user_id = auth.uid()
      )
    )
  )
);