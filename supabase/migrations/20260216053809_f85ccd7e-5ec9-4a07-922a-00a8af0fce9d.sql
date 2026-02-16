
-- 1. Add is_test column
ALTER TABLE public.entities ADD COLUMN is_test boolean NOT NULL DEFAULT false;

-- 2. Flag the 5 seed entities
UPDATE public.entities SET is_test = true WHERE id IN (
  'e1111111-1111-1111-1111-111111111111',
  'e2222222-2222-2222-2222-222222222222',
  'e3333333-3333-3333-3333-333333333333',
  'e4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

-- 3. Recreate entities_public view filtering out test entities
CREATE OR REPLACE VIEW public.entities_public AS
SELECT id, name, city, accepted_donations, observations, pix_key, pix_name, created_at
FROM public.entities
WHERE is_test = false;
