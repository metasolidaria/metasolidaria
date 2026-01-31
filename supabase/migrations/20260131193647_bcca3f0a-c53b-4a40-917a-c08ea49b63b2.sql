-- 1. Remover views dependentes
DROP VIEW IF EXISTS groups_public CASCADE;
DROP VIEW IF EXISTS groups_admin CASCADE;

-- 2. Remover a materialized view
DROP MATERIALIZED VIEW IF EXISTS group_stats CASCADE;

-- 3. Recriar como VIEW regular
CREATE VIEW group_stats AS
SELECT 
  g.id AS group_id,
  COUNT(gm.id) AS member_count,
  COALESCE(SUM(mc.personal_goal), 0) AS total_goals,
  COALESCE((
    SELECT SUM(gp.amount) 
    FROM goal_progress gp 
    WHERE gp.group_id = g.id
  ), 0) AS total_donations
FROM groups g
LEFT JOIN group_members gm ON gm.group_id = g.id
LEFT JOIN member_commitments mc ON mc.member_id = gm.id
GROUP BY g.id;

-- 4. Conceder permissões
GRANT SELECT ON group_stats TO anon, authenticated;

-- 5. Recriar groups_public (mesma definição anterior)
CREATE VIEW groups_public WITH (security_invoker=on) AS
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
LEFT JOIN group_stats gs ON gs.group_id = g.id;

-- 6. Conceder permissões para groups_public
GRANT SELECT ON groups_public TO anon, authenticated;

-- 7. Recriar groups_admin
CREATE VIEW groups_admin WITH (security_invoker=on) AS
SELECT 
  g.id, g.name, g.city, g.donation_type, g.goal_2026,
  g.is_private, g.leader_id, g.leader_name, g.leader_whatsapp,
  u.email as leader_email, g.description, g.entity_id, 
  g.image_url, g.end_date, g.created_at, g.updated_at,
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_donations, 0) as total_donations,
  COALESCE(gs.total_goals, 0) as total_goals,
  g.view_count, g.members_visible
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
LEFT JOIN auth.users u ON u.id = g.leader_id;

-- 8. Remover função de refresh (não mais necessária)
DROP FUNCTION IF EXISTS refresh_group_stats() CASCADE;