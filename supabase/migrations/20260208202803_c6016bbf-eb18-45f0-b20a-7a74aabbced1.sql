-- Recriar groups_public para mostrar apenas grupos públicos
-- Grupos privados devem ser acessados diretamente via tabela groups com RLS

DROP VIEW IF EXISTS groups_public CASCADE;

CREATE VIEW groups_public
WITH (security_invoker = off) AS
SELECT 
  g.id, g.name, g.city, g.donation_type, g.goal_2026,
  g.is_private, g.leader_id, g.leader_name, g.description,
  g.entity_id, g.end_date, g.created_at, g.updated_at,
  g.image_url, g.members_visible, g.view_count,
  g.default_commitment_name, g.default_commitment_metric,
  g.default_commitment_ratio, g.default_commitment_donation,
  g.default_commitment_goal,
  COALESCE(gs.member_count, 0) AS member_count,
  COALESCE(gs.total_goals, 0) AS total_goals,
  COALESCE(gs.total_donations, 0) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE g.is_private = false;

GRANT SELECT ON groups_public TO anon, authenticated;