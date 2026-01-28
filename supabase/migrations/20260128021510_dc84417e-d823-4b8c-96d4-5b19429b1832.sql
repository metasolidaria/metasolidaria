-- Add expires_at column for partnership expiration tracking
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS expires_at date DEFAULT NULL;

COMMENT ON COLUMN public.partners.expires_at IS 'Data de expiração da parceria';

-- Drop and recreate partners_public view to include expires_at
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
  latitude,
  longitude,
  tier,
  instagram,
  created_at,
  expires_at
FROM public.partners
WHERE is_approved = true;