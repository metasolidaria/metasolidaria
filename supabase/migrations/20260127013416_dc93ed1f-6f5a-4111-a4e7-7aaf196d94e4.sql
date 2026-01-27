-- Adicionar coluna image_url na tabela groups
ALTER TABLE public.groups ADD COLUMN image_url text;

-- Criar bucket para imagens dos grupos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('group-images', 'group-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Política: Qualquer pessoa pode ver as imagens (bucket público)
CREATE POLICY "Public can view group images"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-images');

-- Política: Líderes podem fazer upload de imagens do seu grupo
CREATE POLICY "Leaders can upload group images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'group-images' 
  AND auth.uid() IS NOT NULL
);

-- Política: Líderes podem atualizar imagens
CREATE POLICY "Leaders can update group images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'group-images' AND auth.uid() IS NOT NULL);

-- Política: Líderes podem deletar imagens
CREATE POLICY "Leaders can delete group images"
ON storage.objects FOR DELETE
USING (bucket_id = 'group-images' AND auth.uid() IS NOT NULL);

-- Atualizar a view groups_public para incluir image_url
DROP VIEW IF EXISTS public.groups_public;
CREATE OR REPLACE VIEW public.groups_public
WITH (security_invoker = on)
AS
SELECT 
  g.id,
  g.name,
  g.city,
  g.donation_type,
  g.goal_2026,
  g.description,
  g.leader_id,
  g.leader_name,
  g.is_private,
  g.created_at,
  g.updated_at,
  g.end_date,
  g.entity_id,
  g.image_url,
  COALESCE(gs.member_count, 0) as member_count,
  COALESCE(gs.total_goals, 0) as total_goals,
  COALESCE(gs.total_donations, 0) as total_donations
FROM public.groups g
LEFT JOIN public.group_stats gs ON g.id = gs.group_id
WHERE 
  g.is_private = false 
  OR g.leader_id = auth.uid()
  OR public.is_group_member(auth.uid(), g.id);