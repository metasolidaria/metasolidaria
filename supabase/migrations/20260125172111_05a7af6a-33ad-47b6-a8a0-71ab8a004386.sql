-- Temporarily disable the validation trigger
DROP TRIGGER IF EXISTS validate_group_data_trigger ON public.groups;

-- Update all public groups to private
UPDATE public.groups SET is_private = true WHERE is_private = false;

-- Re-enable the validation trigger
CREATE TRIGGER validate_group_data_trigger
  BEFORE INSERT OR UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION validate_group_data();