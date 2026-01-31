-- =============================================
-- PUSH NOTIFICATIONS SYSTEM
-- =============================================

-- 1. Tabela para armazenar inscrições de push
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text, -- URL do Web Push service
  p256dh text, -- Chave pública para Web Push
  auth text, -- Chave de autenticação para Web Push
  platform text NOT NULL DEFAULT 'web', -- 'web' | 'android' | 'ios'
  device_token text, -- Token FCM/APNs para apps nativos
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_platform CHECK (platform IN ('web', 'android', 'ios'))
);

-- 2. Tabela para preferências de notificação
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  join_requests boolean NOT NULL DEFAULT true,
  new_donations boolean NOT NULL DEFAULT true,
  new_members boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Índices para performance
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- 4. Trigger para atualizar updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Habilitar RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para push_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para notification_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION TO SEND NOTIFICATION VIA EDGE FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.notify_group_leader(
  _event_type text,
  _group_id uuid,
  _actor_name text,
  _details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _leader_id uuid;
  _group_name text;
  _supabase_url text := current_setting('app.settings.supabase_url', true);
  _service_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Buscar líder e nome do grupo
  SELECT leader_id, name INTO _leader_id, _group_name
  FROM groups
  WHERE id = _group_id;

  IF _leader_id IS NULL THEN
    RETURN;
  END IF;

  -- Chamar edge function via pg_net (se disponível) ou apenas logar
  -- A edge function será chamada pelo trigger usando http extension
  PERFORM net.http_post(
    url := 'https://khljnkbibirxysufgemb.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := jsonb_build_object(
      'event_type', _event_type,
      'leader_id', _leader_id,
      'group_id', _group_id,
      'group_name', _group_name,
      'actor_name', _actor_name,
      'details', _details
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Se pg_net não estiver disponível ou falhar, apenas logar
  RAISE NOTICE 'Push notification failed: %', SQLERRM;
END;
$$;

-- =============================================
-- TRIGGERS PARA EVENTOS DE NOTIFICAÇÃO
-- =============================================

-- Trigger function para nova solicitação de entrada
CREATE OR REPLACE FUNCTION public.trigger_notify_join_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.notify_group_leader(
    'join_request',
    NEW.group_id,
    NEW.user_name,
    jsonb_build_object('request_id', NEW.id, 'message', NEW.message)
  );
  RETURN NEW;
END;
$$;

-- Trigger function para nova doação/progresso
CREATE OR REPLACE FUNCTION public.trigger_notify_new_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _member_name text;
  _donation_type text;
BEGIN
  -- Buscar nome do membro e tipo de doação
  SELECT gm.name, g.donation_type 
  INTO _member_name, _donation_type
  FROM group_members gm
  JOIN groups g ON g.id = gm.group_id
  WHERE gm.id = NEW.member_id;

  PERFORM public.notify_group_leader(
    'new_donation',
    NEW.group_id,
    COALESCE(_member_name, 'Membro'),
    jsonb_build_object(
      'amount', NEW.amount, 
      'donation_type', _donation_type,
      'description', NEW.description
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger function para novo membro
CREATE OR REPLACE FUNCTION public.trigger_notify_new_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _leader_id uuid;
BEGIN
  -- Não notificar se for o líder se adicionando
  SELECT leader_id INTO _leader_id FROM groups WHERE id = NEW.group_id;
  
  IF NEW.user_id = _leader_id THEN
    RETURN NEW;
  END IF;

  PERFORM public.notify_group_leader(
    'new_member',
    NEW.group_id,
    NEW.name,
    jsonb_build_object('member_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

-- Criar triggers
CREATE TRIGGER on_join_request_created
  AFTER INSERT ON public.group_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_join_request();

CREATE TRIGGER on_donation_created
  AFTER INSERT ON public.goal_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_new_donation();

CREATE TRIGGER on_member_joined
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_new_member();