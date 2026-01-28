-- Add logo_url column to partners table
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for partner logos
CREATE POLICY "Anyone can view partner logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-logos');

CREATE POLICY "Admins can upload partner logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'partner-logos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update partner logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'partner-logos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete partner logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'partner-logos' AND public.is_admin(auth.uid()));

-- Update partners_public view to include logo_url
DROP VIEW IF EXISTS public.partners_public;
CREATE VIEW public.partners_public AS
SELECT 
  id,
  name,
  specialty,
  city,
  whatsapp,
  description,
  is_approved,
  created_at,
  latitude,
  longitude,
  tier,
  instagram,
  expires_at,
  logo_url
FROM public.partners;