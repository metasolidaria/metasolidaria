-- Remover a view com security_invoker
DROP VIEW IF EXISTS public.groups_admin;

-- Recriar baseada na função SECURITY DEFINER
CREATE VIEW public.groups_admin AS
SELECT 
  id, name, city, donation_type, goal_2026, is_private,
  leader_id, leader_name, leader_whatsapp, leader_email,
  description, entity_id, image_url, end_date,
  created_at, updated_at, member_count, total_donations, total_goals
FROM get_admin_groups();

-- Manter controle de acesso restritivo
REVOKE ALL ON public.groups_admin FROM anon, authenticated;
GRANT SELECT ON public.groups_admin TO authenticated;