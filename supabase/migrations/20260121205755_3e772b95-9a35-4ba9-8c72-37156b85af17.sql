-- Drop the existing SELECT policy that requires authentication
DROP POLICY IF EXISTS "Anyone authenticated can view entities" ON public.entities;

-- Create new policy allowing public read access to entities
CREATE POLICY "Anyone can view entities" 
ON public.entities 
FOR SELECT 
USING (true);