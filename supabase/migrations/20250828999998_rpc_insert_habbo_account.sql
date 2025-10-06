-- ========================================
-- FUNÇÃO RPC PARA INSERIR HABBO ACCOUNTS VIA EDGE FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION insert_habbo_account_via_service(account_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do dono da função
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Log da operação
  RAISE NOTICE 'Inserting habbo account via service: %', account_data;
  
  -- Inserir na tabela habbo_accounts
  INSERT INTO public.habbo_accounts (
    supabase_user_id,
    habbo_name,
    habbo_id,
    hotel,
    figure_string,
    motto,
    is_online,
    is_admin
  ) VALUES (
    (account_data->>'supabase_user_id')::uuid,
    account_data->>'habbo_name',
    account_data->>'habbo_id',
    account_data->>'hotel',
    account_data->>'figure_string',
    account_data->>'motto',
    (account_data->>'is_online')::boolean,
    (account_data->>'is_admin')::boolean
  )
  ON CONFLICT (supabase_user_id) 
  DO UPDATE SET
    habbo_name = EXCLUDED.habbo_name,
    habbo_id = EXCLUDED.habbo_id,
    hotel = EXCLUDED.hotel,
    figure_string = EXCLUDED.figure_string,
    motto = EXCLUDED.motto,
    is_online = EXCLUDED.is_online,
    is_admin = EXCLUDED.is_admin,
    updated_at = now()
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Dar permissão para uso via Edge Functions
GRANT EXECUTE ON FUNCTION insert_habbo_account_via_service(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION insert_habbo_account_via_service(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_habbo_account_via_service(jsonb) TO anon;

-- Log de sucesso
SELECT 'RPC function created successfully' as status;

