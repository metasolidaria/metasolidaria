-- Add city column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN city text;

-- Update validate_profile_data function to include city validation
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate full_name length
  IF length(NEW.full_name) < 2 THEN
    RAISE EXCEPTION 'Nome deve ter pelo menos 2 caracteres';
  END IF;
  IF length(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate city length (if provided)
  IF NEW.city IS NOT NULL AND length(NEW.city) > 100 THEN
    RAISE EXCEPTION 'Cidade deve ter no máximo 100 caracteres';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function to include city
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, whatsapp, city)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    NEW.raw_user_meta_data->>'city'
  );
  RETURN NEW;
END;
$function$;