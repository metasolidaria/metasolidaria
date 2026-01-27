-- =====================================================
-- CORREÇÃO 1: Restringir Acesso aos Códigos de Convite
-- =====================================================

-- 1. Remover política vulnerável que expõe todos os convites
DROP POLICY IF EXISTS "Anyone can view link invitations by code for validation" ON group_invitations;

-- 2. Criar função segura para validar convite (não expõe lista)
CREATE OR REPLACE FUNCTION public.validate_invite_code(_invite_code text)
RETURNS TABLE (group_id uuid, group_name text, is_valid boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    gi.group_id,
    g.name as group_name,
    true as is_valid
  FROM group_invitations gi
  JOIN groups g ON g.id = gi.group_id
  WHERE gi.invite_code = _invite_code
    AND gi.invite_type = 'link'
    AND gi.status = 'pending'
    AND gi.expires_at > now()
  LIMIT 1;
$$;

-- =====================================================
-- CORREÇÃO 2: Ocultar Telefones de Entidades
-- =====================================================

-- 1. Criar view pública sem telefone
CREATE OR REPLACE VIEW public.entities_public
WITH (security_invoker = off) AS
SELECT 
  id,
  name,
  city,
  created_at
FROM entities;

-- 2. Conceder acesso à view
GRANT SELECT ON public.entities_public TO anon, authenticated;

-- 3. Remover política de leitura pública da tabela base
DROP POLICY IF EXISTS "Anyone can view entities" ON entities;

-- 4. Criar política restritiva: apenas criador pode ver dados completos
CREATE POLICY "Users can view their own entities"
  ON entities FOR SELECT
  USING (auth.uid() = created_by);

-- 5. Permitir líderes de grupos vinculados verem os dados completos
CREATE POLICY "Group leaders can view linked entities"
  ON entities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.entity_id = entities.id
      AND g.leader_id = auth.uid()
    )
  );

-- =====================================================
-- CORREÇÃO 3: Filtrar Grupos Privados das Estatísticas
-- =====================================================

DROP VIEW IF EXISTS public.impact_stats_public;

CREATE VIEW public.impact_stats_public
WITH (security_invoker = off) AS
SELECT 
  g.donation_type,
  SUM(gp.amount) as total_amount,
  COUNT(gp.id) as total_entries
FROM goal_progress gp
JOIN groups g ON g.id = gp.group_id
WHERE g.is_private = false
GROUP BY g.donation_type;

GRANT SELECT ON public.impact_stats_public TO anon, authenticated;

-- =====================================================
-- CORREÇÃO 4: Filtrar Grupos Privados do Hero Stats
-- =====================================================

DROP VIEW IF EXISTS public.hero_stats_public;

CREATE VIEW public.hero_stats_public
WITH (security_invoker = off) AS
SELECT 
  (SELECT count(*) FROM groups WHERE is_private = false) AS total_groups,
  (SELECT count(*) FROM group_members gm 
   JOIN groups g ON g.id = gm.group_id 
   WHERE g.is_private = false) AS total_users,
  (SELECT COALESCE(sum(mc.personal_goal), 0) 
   FROM member_commitments mc
   JOIN group_members gm ON gm.id = mc.member_id
   JOIN groups g ON g.id = gm.group_id
   WHERE g.is_private = false) AS total_goals;

GRANT SELECT ON public.hero_stats_public TO anon, authenticated;