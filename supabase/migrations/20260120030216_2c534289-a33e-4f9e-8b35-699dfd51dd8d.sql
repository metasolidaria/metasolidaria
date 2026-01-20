-- Adicionar campos de coordenadas à tabela partners
ALTER TABLE public.partners
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;

-- Criar índice para melhorar performance das consultas por coordenadas
CREATE INDEX idx_partners_coordinates ON public.partners (latitude, longitude);