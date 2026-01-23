-- Revoke direct API access to materialized view (it's only used internally by groups_public)
REVOKE ALL ON public.group_stats FROM anon, authenticated;

-- Grant access only to the groups_public view
GRANT SELECT ON public.groups_public TO anon, authenticated;