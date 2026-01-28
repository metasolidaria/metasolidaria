-- Permitir admins visualizarem membros de qualquer grupo
CREATE POLICY "Admins can view all group members"
ON public.group_members FOR SELECT
USING (is_admin(auth.uid()));