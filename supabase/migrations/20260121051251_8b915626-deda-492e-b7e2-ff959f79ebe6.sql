-- Adicionar colunas de compromisso na tabela group_members
ALTER TABLE public.group_members 
  ADD COLUMN IF NOT EXISTS commitment_type text,
  ADD COLUMN IF NOT EXISTS commitment_metric text,
  ADD COLUMN IF NOT EXISTS commitment_ratio integer DEFAULT 1;

-- Comentários para documentação
COMMENT ON COLUMN public.group_members.commitment_type IS 'Tipo do compromisso: peso, gordura, exercicio, passos, custom';
COMMENT ON COLUMN public.group_members.commitment_metric IS 'Descrição da métrica: kg perdido, % gordura reduzido, etc';
COMMENT ON COLUMN public.group_members.commitment_ratio IS 'Proporção: a cada X unidades da métrica = Y unidades de doação';