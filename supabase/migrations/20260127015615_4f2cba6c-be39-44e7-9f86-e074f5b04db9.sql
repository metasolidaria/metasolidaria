-- Drop the problematic policy that directly queries auth.users
DROP POLICY IF EXISTS "Users can view their own pending invitations" ON public.group_invitations;

-- Recreate the policy using the SECURITY DEFINER function
CREATE POLICY "Users can view their own pending invitations" 
  ON public.group_invitations 
  FOR SELECT 
  USING (
    public.is_current_user_email(email)
    AND status = 'pending'
    AND expires_at > now()
  );