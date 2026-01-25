-- Add referrer information columns to partners table
ALTER TABLE public.partners
ADD COLUMN referrer_name text,
ADD COLUMN referrer_phone text;