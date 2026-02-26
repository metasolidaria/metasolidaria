
DROP VIEW IF EXISTS public.entities_public;
CREATE VIEW public.entities_public WITH (security_invoker=on) AS
  SELECT id, name, city, accepted_donations, observations, pix_key, pix_name, pix_qr_code_url, created_at
  FROM public.entities
  WHERE is_test = false;
