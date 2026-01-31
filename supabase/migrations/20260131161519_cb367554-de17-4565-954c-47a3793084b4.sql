
-- Recriar a view groups_admin para usar a função SECURITY DEFINER
-- em vez de fazer JOIN direto com auth.users
-- Isso resolve o alerta de "Exposed Auth Users"

DROP VIEW IF EXISTS public.groups_admin;

CREATE VIEW public.groups_admin AS
SELECT 
    id,
    name,
    city,
    donation_type,
    goal_2026,
    is_private,
    leader_id,
    leader_name,
    leader_whatsapp,
    leader_email,
    description,
    entity_id,
    image_url,
    end_date,
    created_at,
    updated_at,
    member_count,
    total_donations,
    total_goals,
    view_count,
    members_visible
FROM get_admin_groups();

-- Adicionar comentário explicativo
COMMENT ON VIEW public.groups_admin IS 'View administrativa de grupos. Usa função SECURITY DEFINER get_admin_groups() para evitar exposição direta de auth.users e garantir verificação de permissão de admin.';
