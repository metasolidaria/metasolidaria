
-- Criar view pública para estatísticas do Doadômetro (sem dados sensíveis)
CREATE VIEW public.impact_stats_public
WITH (security_invoker = off) AS
SELECT 
  g.donation_type,
  SUM(gp.amount) as total_amount,
  COUNT(gp.id) as total_entries
FROM goal_progress gp
JOIN groups g ON g.id = gp.group_id
GROUP BY g.donation_type;

-- Conceder acesso de leitura para usuários anônimos
GRANT SELECT ON public.impact_stats_public TO anon;
GRANT SELECT ON public.impact_stats_public TO authenticated;
