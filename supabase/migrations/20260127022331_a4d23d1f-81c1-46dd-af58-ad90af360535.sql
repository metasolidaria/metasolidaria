-- Criar view pública para busca de grupos (sem dados sensíveis)
-- Permite que qualquer pessoa busque grupos para solicitar entrada
CREATE OR REPLACE VIEW public.groups_search
WITH (security_invoker = off) AS
SELECT 
  id,
  name,
  city,
  is_private,
  leader_name,
  donation_type
FROM groups;

-- Conceder permissão de leitura para usuários anônimos e autenticados
GRANT SELECT ON public.groups_search TO anon;
GRANT SELECT ON public.groups_search TO authenticated;