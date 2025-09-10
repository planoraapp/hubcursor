-- ========================================
-- CRIAR FUNÇÃO RPC get_auth_email_for_habbo
-- Função que está faltando e causando erro 404
-- ========================================

CREATE OR REPLACE FUNCTION get_auth_email_for_habbo(
  habbo_name_param TEXT,
  hotel_param TEXT DEFAULT 'br'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_email TEXT;
BEGIN
  -- Buscar o email do usuário baseado no nome Habbo e hotel
  SELECT au.email INTO auth_email
  FROM public.habbo_accounts ha
  JOIN auth.users au ON ha.supabase_user_id = au.id
  WHERE LOWER(ha.habbo_name) = LOWER(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;

  -- Retornar o email encontrado ou NULL se não encontrar
  RETURN auth_email;
END;
$$;

-- Dar permissão para a função ser executada
GRANT EXECUTE ON FUNCTION get_auth_email_for_habbo(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_email_for_habbo(TEXT, TEXT) TO anon;