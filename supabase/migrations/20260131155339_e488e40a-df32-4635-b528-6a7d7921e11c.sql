-- Add new columns to entities table for accepted donations and observations
ALTER TABLE public.entities 
ADD COLUMN IF NOT EXISTS accepted_donations text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS observations text;

-- Update the entities_public view to include new columns
DROP VIEW IF EXISTS public.entities_public;
CREATE VIEW public.entities_public AS
SELECT 
  id,
  name,
  city,
  accepted_donations,
  observations,
  created_at
FROM public.entities;

-- Grant access to the view
GRANT SELECT ON public.entities_public TO anon, authenticated;