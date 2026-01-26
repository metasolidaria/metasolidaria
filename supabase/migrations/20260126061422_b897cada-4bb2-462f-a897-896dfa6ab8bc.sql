-- Drop and recreate the partners_public view to include whatsapp field
DROP VIEW IF EXISTS public.partners_public;

CREATE VIEW public.partners_public AS
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
  instagram,
  whatsapp
FROM public.partners
WHERE is_approved = true;