-- Alterar expiração padrão de convites de grupo de 7 para 30 dias
ALTER TABLE public.group_invitations 
ALTER COLUMN expires_at 
SET DEFAULT (now() + '30 days'::interval);