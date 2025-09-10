-- Função para criar conta admin do Habbo contornando constraints
CREATE OR REPLACE FUNCTION create_habbo_admin_account(
    p_habbo_name TEXT,
    p_hotel TEXT,
    p_habbo_id TEXT,
    p_figure_string TEXT,
    p_motto TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID := '00000000-0000-0000-0000-000000000000';
    result JSON;
BEGIN
    -- Primeiro, tentar criar usuário na tabela auth.users se não existir
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        last_sign_in_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        phone_confirmed_at,
        phone,
        phone_confirmed_at,
        phone_change_sent_at,
        confirmed_at,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
    ) VALUES (
        admin_user_id,
        CONCAT(p_habbo_name, '@', p_hotel, '.habbohub.com'),
        '$2a$10$dummy.hash.for.admin.user',
        NOW(),
        NOW(),
        NOW(),
        '{"habbo_name": "' || p_habbo_name || '"}',
        '{"habbo_name": "' || p_habbo_name || '"}',
        false,
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        '',
        NULL,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NOW(),
        0,
        NULL,
        '',
        NULL,
        false,
        NULL,
        false
    ) ON CONFLICT (id) DO NOTHING;

    -- Agora inserir na tabela habbo_accounts
    INSERT INTO habbo_accounts (
        habbo_name,
        hotel,
        supabase_user_id,
        habbo_id,
        figure_string,
        motto,
        is_admin,
        is_online
    ) VALUES (
        p_habbo_name,
        p_hotel,
        admin_user_id,
        p_habbo_id,
        p_figure_string,
        p_motto,
        true,
        false
    ) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
        habbo_id = EXCLUDED.habbo_id,
        figure_string = EXCLUDED.figure_string,
        motto = EXCLUDED.motto,
        is_admin = EXCLUDED.is_admin,
        is_online = EXCLUDED.is_online;

    -- Retornar dados da conta criada
    SELECT row_to_json(ha.*) INTO result
    FROM habbo_accounts ha
    WHERE ha.habbo_name = p_habbo_name 
    AND ha.hotel = p_hotel;

    RETURN result;
END;
$$;
