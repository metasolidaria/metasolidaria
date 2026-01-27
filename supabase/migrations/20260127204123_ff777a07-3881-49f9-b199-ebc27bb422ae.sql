-- Permitir admins criarem convites para qualquer grupo
CREATE POLICY "Admins can create invitations for any group"
ON public.group_invitations FOR INSERT
WITH CHECK (is_admin(auth.uid()));