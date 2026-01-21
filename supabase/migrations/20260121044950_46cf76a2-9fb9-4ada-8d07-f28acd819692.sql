-- Make specialty and whatsapp optional in partners table
ALTER TABLE partners ALTER COLUMN specialty DROP NOT NULL;
ALTER TABLE partners ALTER COLUMN whatsapp DROP NOT NULL;