-- Recriar a view groups_search para incluir a descrição do grupo
DROP VIEW IF EXISTS public.groups_search;

CREATE VIEW public.groups_search AS
SELECT 
  id,
  name,
  city,
  is_private,
  leader_name,
  donation_type,
  description
FROM public.groups;