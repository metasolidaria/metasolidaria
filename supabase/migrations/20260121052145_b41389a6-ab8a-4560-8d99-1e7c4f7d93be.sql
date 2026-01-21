-- Adicionar coluna para doação de desafio caso não bata a meta
ALTER TABLE public.group_members 
  ADD COLUMN IF NOT EXISTS penalty_donation integer DEFAULT NULL;

COMMENT ON COLUMN public.group_members.penalty_donation IS 'Quantidade extra que o membro se compromete a doar se não bater a meta pessoal';