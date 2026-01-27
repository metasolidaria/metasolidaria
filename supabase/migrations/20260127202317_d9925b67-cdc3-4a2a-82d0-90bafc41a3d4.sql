-- Add RLS policies for admin access to entities table

-- Admins can view all entities
CREATE POLICY "Admins can view all entities"
ON public.entities FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update any entity
CREATE POLICY "Admins can update any entity"
ON public.entities FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete any entity
CREATE POLICY "Admins can delete any entity"
ON public.entities FOR DELETE
USING (is_admin(auth.uid()));