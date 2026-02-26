
CREATE OR REPLACE FUNCTION public.get_email_by_phone(_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _normalized_phone text;
  _email text;
BEGIN
  -- Normalizar telefone (remover caracteres especiais)
  _normalized_phone := regexp_replace(_phone, '[^0-9]', '', 'g');

  -- Buscar email do usuário pelo WhatsApp no perfil
  SELECT u.email INTO _email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE regexp_replace(p.whatsapp, '[^0-9]', '', 'g') = _normalized_phone
  LIMIT 1;

  RETURN _email;
END;
$function$;
