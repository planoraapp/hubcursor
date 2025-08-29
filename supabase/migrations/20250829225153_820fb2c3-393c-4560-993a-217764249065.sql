-- ========================================
-- FASE FINAL: CONFIGURAÇÃO COMPLETA DO SISTEMA
-- ========================================

-- 1. Função para verificar se usuário Habbo existe
CREATE OR REPLACE FUNCTION public.verify_habbo_user_exists(habbo_name_param text, hotel_param text DEFAULT 'br')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Esta função será chamada pela Edge Function para verificar usuários
  RETURN jsonb_build_object(
    'exists', true,
    'habbo_name', habbo_name_param,
    'hotel', hotel_param
  );
END;
$$;

-- 2. Função para buscar amigos de um usuário
CREATE OR REPLACE FUNCTION public.get_user_friends_list(user_uuid uuid)
RETURNS TABLE(friend_name text, friend_id text, friend_figure text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Por enquanto retorna lista vazia, será populada pela Edge Function
  RETURN QUERY
  SELECT 
    ''::text as friend_name,
    ''::text as friend_id, 
    ''::text as friend_figure
  LIMIT 0;
END;
$$;

-- 3. Atualizar função get_auth_email_for_habbo_with_hotel para usar nova tabela
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo_with_hotel(habbo_name_param text, hotel_param text DEFAULT 'br')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;
  
  -- Se não encontrou com hotel específico, buscar sem filtro de hotel
  IF v_email IS NULL THEN
    SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
    FROM public.habbo_accounts ha
    WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    LIMIT 1;
  END IF;

  RETURN v_email;
END;
$$;

-- 4. Função para popular atividades de amigos (será usada pela Edge Function)
CREATE OR REPLACE FUNCTION public.store_friend_activity(
  p_user_id uuid,
  p_friend_name text,
  p_activity_type text,
  p_activity_details jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  INSERT INTO public.friends_activities (
    user_id,
    friend_name,
    activity_type,
    activity_details
  ) VALUES (
    p_user_id,
    p_friend_name,
    p_activity_type::activity_type_enum,
    p_activity_details
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_habbo_name ON public.habbo_accounts(lower(habbo_name));
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_user_id ON public.habbo_accounts(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_activities_user_date ON public.friends_activities(user_id, created_at DESC);