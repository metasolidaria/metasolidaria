
-- Add is_test column to groups table
ALTER TABLE groups ADD COLUMN is_test boolean NOT NULL DEFAULT false;

-- Recreate groups_public with is_test
DROP VIEW IF EXISTS groups_public CASCADE;
CREATE VIEW groups_public WITH (security_invoker = off) AS
SELECT g.id, g.name, g.city, g.donation_type, g.goal_2026,
  g.is_private, g.leader_id, g.leader_name, g.description,
  g.entity_id, g.end_date, g.created_at, g.updated_at,
  g.image_url, g.members_visible, g.view_count, g.is_test,
  g.default_commitment_name, g.default_commitment_metric,
  g.default_commitment_ratio, g.default_commitment_donation,
  g.default_commitment_goal,
  COALESCE(gs.member_count, 0::bigint) AS member_count,
  COALESCE(gs.total_goals, 0::bigint) AS total_goals,
  COALESCE(gs.total_donations, 0::bigint) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id
WHERE g.is_private = false;

-- Recreate groups_my with is_test
DROP VIEW IF EXISTS groups_my CASCADE;
CREATE VIEW groups_my WITH (security_invoker = off) AS
SELECT g.id, g.name, g.city, g.donation_type, g.goal_2026,
  g.is_private, g.leader_id, g.leader_name, g.description,
  g.image_url, g.end_date, g.entity_id, g.members_visible,
  g.view_count, g.is_test,
  g.default_commitment_name, g.default_commitment_metric,
  g.default_commitment_ratio, g.default_commitment_donation,
  g.default_commitment_goal,
  g.created_at, g.updated_at,
  COALESCE(gs.member_count, 0::bigint) AS member_count,
  COALESCE(gs.total_goals, 0::bigint) AS total_goals,
  COALESCE(gs.total_donations, 0::bigint) AS total_donations
FROM groups g
LEFT JOIN group_stats gs ON gs.group_id = g.id;

-- Recreate groups_admin with is_test
DROP VIEW IF EXISTS groups_admin CASCADE;
CREATE VIEW groups_admin WITH (security_invoker = off) AS
SELECT g.id, g.name, g.city, g.donation_type, g.goal_2026,
  g.is_private, g.members_visible, g.leader_id, g.leader_name,
  g.leader_whatsapp, g.description, g.entity_id, g.image_url,
  g.end_date, g.created_at, g.updated_at, g.view_count, g.is_test,
  u.email AS leader_email,
  COALESCE(gs.member_count, 0::bigint) AS member_count,
  COALESCE(gs.total_donations, 0::bigint) AS total_donations,
  COALESCE(gs.total_goals, 0::bigint) AS total_goals
FROM groups g
LEFT JOIN auth.users u ON g.leader_id = u.id
LEFT JOIN group_stats gs ON g.id = gs.group_id
WHERE is_admin(auth.uid());
