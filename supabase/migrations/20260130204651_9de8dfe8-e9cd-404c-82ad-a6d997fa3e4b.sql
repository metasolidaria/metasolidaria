-- Add members_visible column to groups table
ALTER TABLE public.groups 
ADD COLUMN members_visible boolean NOT NULL DEFAULT true;