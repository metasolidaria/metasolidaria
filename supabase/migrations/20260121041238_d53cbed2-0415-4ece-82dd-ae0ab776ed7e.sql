-- Add personal_goal column to group_members for individual member goals
ALTER TABLE public.group_members 
ADD COLUMN personal_goal integer DEFAULT 0;

-- Update default for goal_2026 in groups table (for new groups without a global goal)
ALTER TABLE public.groups 
ALTER COLUMN goal_2026 SET DEFAULT 0;

-- Add RLS policy for members to update their own personal_goal
CREATE POLICY "Members can update their own personal_goal"
ON public.group_members
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);