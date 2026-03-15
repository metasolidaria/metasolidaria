
-- Add commitment_id column to goal_progress (nullable for backwards compatibility)
ALTER TABLE public.goal_progress 
ADD COLUMN commitment_id uuid REFERENCES public.member_commitments(id) ON DELETE SET NULL;
