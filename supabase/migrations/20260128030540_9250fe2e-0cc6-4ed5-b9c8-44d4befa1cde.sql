-- Remover constraint antiga
ALTER TABLE public.partners DROP CONSTRAINT IF EXISTS partners_tier_check;

-- Adicionar nova constraint com "premium" no lugar de "diamante"
ALTER TABLE public.partners 
ADD CONSTRAINT partners_tier_check 
CHECK (tier = ANY (ARRAY['premium', 'ouro', 'apoiador']));

-- Atualizar registros existentes que usam "diamante" para "premium"
UPDATE public.partners SET tier = 'premium' WHERE tier = 'diamante';