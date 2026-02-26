-- Allow all authenticated users to SELECT from entities (for the entities_public view)
-- This is safe because entities_public already filters out test entities and excludes phone numbers
CREATE POLICY "Authenticated users can view entities"
  ON public.entities FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_test = false);