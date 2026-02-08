-- Recriar view group_members_public com security_invoker=off
-- Isso resolve o problema de membros não aparecerem em grupos privados

CREATE OR REPLACE VIEW group_members_public
WITH (security_invoker = off) AS
SELECT 
    gm.id,
    gm.group_id,
    gm.user_id,
    gm.name,
    gm.personal_goal,
    gm.goals_reached,
    gm.commitment_type,
    gm.commitment_metric,
    gm.commitment_ratio,
    gm.commitment_donation,
    gm.penalty_donation,
    gm.created_at,
    gm.updated_at,
    CASE
        WHEN g.whatsapp_visible = true THEN gm.whatsapp
        WHEN gm.user_id = auth.uid() THEN gm.whatsapp
        WHEN g.leader_id = auth.uid() THEN gm.whatsapp
        WHEN is_admin(auth.uid()) THEN gm.whatsapp
        ELSE NULL
    END AS whatsapp
FROM group_members gm
JOIN groups g ON g.id = gm.group_id
WHERE 
    -- Grupo público: qualquer pessoa pode ver
    g.is_private = false
    -- OU grupo privado: apenas líder, membros ou admin podem ver
    OR g.leader_id = auth.uid()
    OR is_group_member(auth.uid(), g.id)
    OR is_admin(auth.uid());