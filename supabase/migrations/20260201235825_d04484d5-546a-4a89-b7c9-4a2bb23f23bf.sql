-- Add cep column to partners table
ALTER TABLE public.partners ADD COLUMN cep text;

-- Update partners_public view to include cep
DROP VIEW IF EXISTS public.partners_public;
CREATE VIEW public.partners_public AS
SELECT 
  id,
  name,
  specialty,
  city,
  cep,
  whatsapp,
  description,
  is_approved,
  created_at,
  latitude,
  longitude,
  tier,
  instagram,
  expires_at,
  logo_url,
  is_test
FROM public.partners;