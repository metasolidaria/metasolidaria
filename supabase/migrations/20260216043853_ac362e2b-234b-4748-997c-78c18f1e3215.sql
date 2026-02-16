
ALTER TABLE public.entities
ADD COLUMN pix_key text DEFAULT NULL,
ADD COLUMN pix_name text DEFAULT NULL;

-- Update the public view to include the new columns
DROP VIEW IF EXISTS public.entities_public;
CREATE VIEW public.entities_public AS
SELECT id, name, city, accepted_donations, observations, pix_key, pix_name, created_at
FROM public.entities;
