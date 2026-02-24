
-- Tabela para cache dos GitHub Sponsors
CREATE TABLE public.github_sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  github_login text NOT NULL UNIQUE,
  github_name text,
  avatar_url text,
  profile_url text,
  tier_name text,
  tier_monthly_price integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: SELECT público, INSERT/UPDATE/DELETE apenas service role
ALTER TABLE public.github_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsors"
ON public.github_sponsors
FOR SELECT
USING (true);
