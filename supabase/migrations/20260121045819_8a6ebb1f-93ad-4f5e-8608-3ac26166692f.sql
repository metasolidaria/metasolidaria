-- Add tier column to partners table
ALTER TABLE partners ADD COLUMN tier text DEFAULT 'apoiador';

-- Add constraint for valid tier values
ALTER TABLE partners ADD CONSTRAINT partners_tier_check 
  CHECK (tier IN ('diamante', 'ouro', 'apoiador'));

-- Insert sample partners in Campinas with different tiers
INSERT INTO partners (name, specialty, city, whatsapp, description, is_approved, latitude, longitude, tier) VALUES
-- Diamante (top tier)
('Dra. Ana Paula Nutrição', 'Nutricionista', 'Campinas, SP', '19999998888', 'Especialista em nutrição esportiva e emagrecimento saudável.', true, -22.9099, -47.0626, 'diamante'),
('Academia Força Total', 'Academia', 'Campinas, SP', '19944443333', 'Academia completa com musculação, crossfit e aulas coletivas.', true, -22.9000, -47.0700, 'diamante'),

-- Ouro (mid tier)
('Dr. Carlos Mendes', 'Médico', 'Campinas, SP', '19988887777', 'Clínico geral com foco em medicina preventiva.', true, -22.9056, -47.0608, 'ouro'),
('Psicóloga Maria Silva', 'Psicólogo', 'Campinas, SP', '19977776666', 'Terapia cognitivo-comportamental e ansiedade.', true, -22.9035, -47.0550, 'ouro'),
('Personal Lucas Fit', 'Personal Trainer', 'Campinas, SP', '19966665555', 'Treinos personalizados para emagrecimento e hipertrofia.', true, -22.9120, -47.0680, 'ouro'),

-- Apoiador (base tier)
('Fisio Paula Movimento', 'Fisioterapeuta', 'Campinas, SP', '19955554444', 'Reabilitação e fisioterapia esportiva.', true, -22.8950, -47.0520, 'apoiador'),
('Supermercado Vida Saudável', 'Supermercado', 'Campinas, SP', '19933332222', 'Produtos orgânicos e naturais.', true, -22.9150, -47.0450, 'apoiador'),
('Empório Natural', 'Comércio', 'Campinas, SP', '19922221111', 'Loja de produtos naturais e suplementos.', true, -22.8980, -47.0580, 'apoiador'),
('Clínica Bem-Estar', 'Clínica', 'Campinas, SP', '19911110000', 'Clínica multidisciplinar de saúde.', true, -22.9070, -47.0650, 'apoiador'),
('Espaço Holístico Zen', 'Outros', 'Campinas, SP', '19900009999', 'Yoga, meditação e terapias alternativas.', true, -22.9020, -47.0600, 'apoiador');