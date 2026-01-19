-- Fix: WhatsApp phone numbers should only be visible to the profile owner
-- Drop the existing SELECT policy that exposes WhatsApp to all group members
DROP POLICY IF EXISTS "Users can view own profile or group members profiles" ON public.profiles;

-- Create a new policy that only allows users to see their own profile (including WhatsApp)
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);