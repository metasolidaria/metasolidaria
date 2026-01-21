-- Remove email-based SELECT access to prevent enumeration
DROP POLICY IF EXISTS "Users can view their own invitations or leaders can view" ON public.group_invitations;

-- Only leaders can view invitations (no email enumeration possible)
CREATE POLICY "Leaders can view group invitations"
ON public.group_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_invitations.group_id
    AND groups.leader_id = auth.uid()
  )
);

-- Create a secure function to accept invitations without exposing emails
CREATE OR REPLACE FUNCTION public.accept_group_invitation(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation record;
  _new_member_id uuid;
  _user_email text;
  _user_name text;
BEGIN
  -- Get current user's email
  SELECT email INTO _user_email FROM auth.users WHERE id = auth.uid();
  
  IF _user_email IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Find the invitation (bypasses RLS due to SECURITY DEFINER)
  SELECT * INTO _invitation
  FROM group_invitations
  WHERE invite_code = _invite_code
    AND status = 'pending'
    AND expires_at > now();

  IF _invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation not found or expired';
  END IF;

  -- Verify the email matches (case-insensitive)
  IF lower(_invitation.email) != lower(_user_email) THEN
    RAISE EXCEPTION 'Invitation is for a different email address';
  END IF;

  -- Check if user is already a member
  IF EXISTS (SELECT 1 FROM group_members WHERE group_id = _invitation.group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'User is already a member of this group';
  END IF;

  -- Get user name
  SELECT COALESCE(raw_user_meta_data->>'full_name', _user_email) INTO _user_name 
  FROM auth.users WHERE id = auth.uid();

  -- Update invitation status
  UPDATE group_invitations
  SET status = 'accepted'
  WHERE id = _invitation.id;

  -- Add user to group
  INSERT INTO group_members (group_id, user_id, name)
  VALUES (_invitation.group_id, auth.uid(), _user_name)
  RETURNING id INTO _new_member_id;

  RETURN _new_member_id;
END;
$$;