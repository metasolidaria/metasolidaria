-- Add is_private column to groups table
ALTER TABLE public.groups ADD COLUMN is_private boolean NOT NULL DEFAULT false;

-- Create group_invitations table
CREATE TABLE public.group_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  invite_code text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS on group_invitations
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy on groups
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;

-- Create new policy: public groups visible to all, private groups only to members
CREATE POLICY "Users can view public groups or private groups they are members of"
ON public.groups
FOR SELECT
USING (
  is_private = false 
  OR leader_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

-- Invitations policies
CREATE POLICY "Group leaders can manage invitations"
ON public.group_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_invitations.group_id 
    AND groups.leader_id = auth.uid()
  )
);

CREATE POLICY "Users can view invitations sent to their email"
ON public.group_invitations
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Update group_members insert policy for private groups (require invitation)
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;

CREATE POLICY "Users can join public groups or private groups with invitation"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Public group: anyone can join
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_id 
      AND groups.is_private = false
    )
    -- Private group: must have valid invitation
    OR EXISTS (
      SELECT 1 FROM public.group_invitations 
      WHERE group_invitations.group_id = group_members.group_id
      AND group_invitations.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND group_invitations.status = 'pending'
      AND group_invitations.expires_at > now()
    )
    -- Or user is the leader
    OR EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_id 
      AND groups.leader_id = auth.uid()
    )
  )
);