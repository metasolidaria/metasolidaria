-- Create table for goal progress entries (partial contributions)
CREATE TABLE public.goal_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.group_members(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;

-- Anyone can view progress entries for groups they can see
CREATE POLICY "Users can view progress for accessible groups"
ON public.goal_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = goal_progress.group_id
    AND (
      groups.is_private = false
      OR groups.leader_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
      )
    )
  )
);

-- Members can add progress entries
CREATE POLICY "Members can add progress entries"
ON public.goal_progress
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.id = goal_progress.member_id
    AND group_members.user_id = auth.uid()
    AND group_members.group_id = goal_progress.group_id
  )
);

-- Users can delete their own progress entries
CREATE POLICY "Users can delete their own progress entries"
ON public.goal_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_goal_progress_group_id ON public.goal_progress(group_id);
CREATE INDEX idx_goal_progress_member_id ON public.goal_progress(member_id);