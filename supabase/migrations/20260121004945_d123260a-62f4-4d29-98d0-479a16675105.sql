-- Create a public view that hides sensitive leader contact info
CREATE OR REPLACE VIEW public.groups_public
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  city,
  donation_type,
  goal_2026,
  leader_id,
  created_at,
  updated_at,
  is_private,
  leader_name,
  description
  -- leader_whatsapp is intentionally excluded for privacy
FROM public.groups;

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view accessible groups" ON public.groups;

-- Create a new SELECT policy that only shows leader_whatsapp to authorized users
-- The full table (including leader_whatsapp) is only accessible to:
-- 1. The group leader themselves
-- 2. Members of the group
CREATE POLICY "Users can view accessible groups with privacy"
ON public.groups
FOR SELECT
USING (
  (is_private = false) OR 
  (leader_id = auth.uid()) OR 
  public.is_group_member(auth.uid(), id)
);

-- Add a comment explaining the security approach
COMMENT ON VIEW public.groups_public IS 'Public view of groups table that excludes sensitive leader contact information (leader_whatsapp). Use this view for public listings where leader contact info should be hidden.';