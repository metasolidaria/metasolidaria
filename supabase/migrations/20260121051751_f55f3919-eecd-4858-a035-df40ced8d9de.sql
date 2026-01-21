-- Adicionar coluna para quantidade de doação no compromisso
ALTER TABLE public.group_members 
  ADD COLUMN IF NOT EXISTS commitment_donation integer DEFAULT 1;

COMMENT ON COLUMN public.group_members.commitment_donation IS 'Quantidade de doação por unidade da métrica: a cada X métrica = Y unidades de doação';