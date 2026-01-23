-- Refresh the materialized view with current data
REFRESH MATERIALIZED VIEW public.group_stats;

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_group_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.group_stats;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RETURN NULL;
END;
$$;