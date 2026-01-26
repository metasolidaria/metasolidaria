-- Fix 1: Create a public view for partners that excludes sensitive data
-- This view will be used for public partner listings
CREATE VIEW public.partners_public
WITH (security_invoker=off) AS
SELECT 
  id,
  name,
  specialty,
  city,
  description,
  is_approved,
  created_at,
  latitude,
  longitude,
  tier,
  instagram
  -- Excluded: whatsapp, referrer_name, referrer_phone, submitted_by, updated_at
FROM public.partners
WHERE is_approved = true;

-- Grant access to public view
GRANT SELECT ON public.partners_public TO anon, authenticated;

-- Fix 2: Restrict admin_emails SELECT policy to only admins
-- First drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view admin emails" ON public.admin_emails;

-- Create new restrictive policy - only admins can view admin emails
CREATE POLICY "Only admins can view admin emails"
ON public.admin_emails
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Fix 3: Update partners table RLS to restrict full data access
-- Drop the existing policy that exposes all columns
DROP POLICY IF EXISTS "Anyone can view approved partners" ON public.partners;

-- Create restrictive policy - full data only for admins and submitter
CREATE POLICY "Admins and submitter can view full partner data"
ON public.partners
FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  (auth.uid() IS NOT NULL AND auth.uid() = submitted_by)
);