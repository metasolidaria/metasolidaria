-- Add instagram column to partners table
ALTER TABLE partners ADD COLUMN instagram text;

-- Update some demo partners with Instagram handles
UPDATE partners SET instagram = 'draanapaula.nutri' WHERE name LIKE '%Ana Paula%';
UPDATE partners SET instagram = 'drcarlosmedico' WHERE name LIKE '%Carlos%' AND specialty = 'Médico';
UPDATE partners SET instagram = 'academiaforce' WHERE name LIKE '%Academia%';
UPDATE partners SET instagram = 'nutri.fernandasantos' WHERE name LIKE '%Fernanda%';