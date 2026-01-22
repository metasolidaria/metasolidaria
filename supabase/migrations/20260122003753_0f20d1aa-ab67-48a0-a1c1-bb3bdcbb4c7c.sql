-- Create validation trigger function for groups table
CREATE OR REPLACE FUNCTION public.validate_group_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate name length
  IF length(NEW.name) < 3 THEN
    RAISE EXCEPTION 'Nome do grupo deve ter pelo menos 3 caracteres';
  END IF;
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Nome do grupo deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate city length
  IF length(NEW.city) < 2 THEN
    RAISE EXCEPTION 'Cidade deve ter pelo menos 2 caracteres';
  END IF;
  IF length(NEW.city) > 100 THEN
    RAISE EXCEPTION 'Cidade deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate description length (if provided)
  IF NEW.description IS NOT NULL AND length(NEW.description) > 1000 THEN
    RAISE EXCEPTION 'Descrição deve ter no máximo 1000 caracteres';
  END IF;
  
  -- Validate leader_name length (if provided)
  IF NEW.leader_name IS NOT NULL AND length(NEW.leader_name) > 100 THEN
    RAISE EXCEPTION 'Nome do líder deve ter no máximo 100 caracteres';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create validation trigger for groups
DROP TRIGGER IF EXISTS validate_group_data_trigger ON public.groups;
CREATE TRIGGER validate_group_data_trigger
  BEFORE INSERT OR UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_group_data();

-- Create validation trigger function for profiles table
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate full_name length
  IF length(NEW.full_name) < 2 THEN
    RAISE EXCEPTION 'Nome deve ter pelo menos 2 caracteres';
  END IF;
  IF length(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create validation trigger for profiles
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON public.profiles;
CREATE TRIGGER validate_profile_data_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

-- Create validation trigger function for partners table
CREATE OR REPLACE FUNCTION public.validate_partner_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate name length
  IF length(NEW.name) < 2 THEN
    RAISE EXCEPTION 'Nome deve ter pelo menos 2 caracteres';
  END IF;
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate city length
  IF length(NEW.city) < 2 THEN
    RAISE EXCEPTION 'Cidade deve ter pelo menos 2 caracteres';
  END IF;
  IF length(NEW.city) > 100 THEN
    RAISE EXCEPTION 'Cidade deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate description length (if provided)
  IF NEW.description IS NOT NULL AND length(NEW.description) > 500 THEN
    RAISE EXCEPTION 'Descrição deve ter no máximo 500 caracteres';
  END IF;
  
  -- Validate specialty length (if provided)
  IF NEW.specialty IS NOT NULL AND length(NEW.specialty) > 100 THEN
    RAISE EXCEPTION 'Especialidade deve ter no máximo 100 caracteres';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create validation trigger for partners
DROP TRIGGER IF EXISTS validate_partner_data_trigger ON public.partners;
CREATE TRIGGER validate_partner_data_trigger
  BEFORE INSERT OR UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_partner_data();