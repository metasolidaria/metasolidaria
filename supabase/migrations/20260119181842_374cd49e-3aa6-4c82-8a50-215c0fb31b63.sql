-- Drop the weak INSERT policy on group_members that only checks auth.uid() IS NOT NULL
DROP POLICY IF EXISTS "Authenticated users can join groups" ON public.group_members;

-- Create a secure INSERT policy that enforces user_id matches the authenticated user
CREATE POLICY "Users can only join groups as themselves" 
ON public.group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);