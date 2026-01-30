CREATE OR REPLACE FUNCTION public.accept_link_invitation(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invitation record;
  _new_member_id uuid;
  _user_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Find the invitation (link type only, must be pending and not expired)
  SELECT * INTO _invitation
  FROM group_invitations
  WHERE invite_code = _invite_code
    AND invite_type = 'link'
    AND status = 'pending'
    AND expires_at > now();

  IF _invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation not found or expired';
  END IF;

  -- Check if user is already a member
  IF EXISTS (SELECT 1 FROM group_members WHERE group_id = _invitation.group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'User is already a member of this group';
  END IF;

  -- Get user name from profile or auth
  SELECT COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email)
  INTO _user_name 
  FROM auth.users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = auth.uid();

  -- NOTE: For link-type invitations, we do NOT update status to 'accepted'
  -- This allows multiple people to use the same invite link until it expires

  -- Add user to group
  INSERT INTO group_members (group_id, user_id, name)
  VALUES (_invitation.group_id, auth.uid(), COALESCE(_user_name, 'Membro'))
  RETURNING id INTO _new_member_id;

  RETURN _new_member_id;
END;
$function$;