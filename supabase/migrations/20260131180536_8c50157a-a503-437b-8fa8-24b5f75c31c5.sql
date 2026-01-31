-- Add is_test column to partners table
ALTER TABLE partners ADD COLUMN is_test BOOLEAN DEFAULT false;

-- Mark existing seed partners as test (using pattern matching for seed UUIDs)
UPDATE partners SET is_test = true WHERE id::text LIKE 'a%-%-%-%-%';

-- Recreate partners_public view to include is_test
DROP VIEW IF EXISTS partners_public;
CREATE VIEW partners_public AS
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
  logo_url,
  is_test
FROM partners;