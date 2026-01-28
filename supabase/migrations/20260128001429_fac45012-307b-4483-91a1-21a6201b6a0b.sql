-- Permitir admins visualizarem todos os perfis para poder editá-los
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));