-- Atualizar política para permitir buscar convites por link (para validação do convite)
-- Remover exigência de autenticação para visualizar convites por link pendentes
DROP POLICY IF EXISTS "Users can view link invitations by code" ON public.group_invitations;

CREATE POLICY "Anyone can view link invitations by code for validation" 
  ON public.group_invitations 
  FOR SELECT 
  USING (
    invite_type = 'link'
    AND status = 'pending'
    AND expires_at > now()
  );