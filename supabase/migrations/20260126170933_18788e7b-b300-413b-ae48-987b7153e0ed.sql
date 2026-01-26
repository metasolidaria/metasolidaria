
-- Allow API roles to read aggregated group stats used by groups_public
GRANT SELECT ON public.group_stats TO anon;
GRANT SELECT ON public.group_stats TO authenticated;
