-- Create a secure function to check if current user owns the email
CREATE OR REPLACE FUNCTION public.is_current_user_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND email = _email
  )
$$;

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their invitations or leaders can view group invi" ON public.group_invitations;

-- Create a more secure policy using the function
CREATE POLICY "Users can view their own invitations or leaders can view"
ON public.group_invitations
FOR SELECT
USING (
  public.is_current_user_email(email)
  OR EXISTS (
    SELECT 1
    FROM public.groups
    WHERE groups.id = group_invitations.group_id
      AND groups.leader_id = auth.uid()
  )
);