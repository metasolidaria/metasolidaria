
-- Create admin_emails table to control access
CREATE TABLE public.admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to check if they're admin
CREATE POLICY "Authenticated users can view admin emails"
  ON public.admin_emails FOR SELECT
  TO authenticated
  USING (true);

-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails ae
    JOIN auth.users u ON lower(u.email) = lower(ae.email)
    WHERE u.id = _user_id
  )
$$;

-- Add RLS policy for admins to update any partner
CREATE POLICY "Admins can update any partner"
  ON public.partners FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add RLS policy for admins to delete partners
CREATE POLICY "Admins can delete partners"
  ON public.partners FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
