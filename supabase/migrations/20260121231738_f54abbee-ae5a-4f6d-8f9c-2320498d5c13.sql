-- Add new columns to member_commitments to make each commitment a complete block
ALTER TABLE member_commitments 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS personal_goal INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalty_donation INTEGER;

-- Migrate existing data: distribute personal_goal and penalty_donation from group_members to their commitments
-- For members with commitments, assign the first commitment to receive the full goal/penalty
UPDATE member_commitments mc
SET 
  personal_goal = gm.personal_goal,
  penalty_donation = gm.penalty_donation
FROM group_members gm
WHERE mc.member_id = gm.id
  AND mc.id = (
    SELECT id FROM member_commitments 
    WHERE member_id = gm.id 
    ORDER BY created_at ASC 
    LIMIT 1
  )
  AND (gm.personal_goal > 0 OR gm.penalty_donation IS NOT NULL);