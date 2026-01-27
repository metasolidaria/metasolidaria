-- Criar enum para papéis de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Criar tabela de papéis de usuário (separada da tabela de perfis por segurança)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem um papel específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Política: Admins podem ver todos os papéis
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Política: Admins podem inserir papéis
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Política: Admins podem atualizar papéis
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Política: Admins podem deletar papéis
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Criar view para admins visualizarem usuários com dados do perfil
CREATE VIEW public.users_admin
WITH (security_invoker = on) AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.full_name,
  p.whatsapp,
  p.city,
  p.created_at,
  p.updated_at,
  u.email,
  u.created_at as user_created_at,
  u.last_sign_in_at,
  (SELECT array_agg(ur.role) FROM public.user_roles ur WHERE ur.user_id = p.user_id) as roles
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE public.is_admin(auth.uid());

-- Dar permissões na view
GRANT SELECT ON public.users_admin TO authenticated;

-- Política para admins atualizarem perfis de outros usuários
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Política para admins deletarem perfis
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Trigger para atualizar updated_at em user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();