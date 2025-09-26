-- ========================================
-- MIGRAÇÃO: FUNÇÕES SQL PARA HABBO_AUTH
-- ========================================

-- 1. Função para verificar se usuário existe
CREATE OR REPLACE FUNCTION check_habbo_auth_exists(username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.habbo_auth 
        WHERE habbo_username = LOWER(username)
    );
END;
$$;

-- 2. Função para criar conta habbo_auth
CREATE OR REPLACE FUNCTION create_habbo_auth_account(
    username TEXT,
    motto TEXT,
    avatar TEXT,
    password TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    hotel TEXT DEFAULT 'br'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_account public.habbo_auth;
BEGIN
    -- Inserir nova conta
    INSERT INTO public.habbo_auth (
        habbo_username,
        habbo_motto,
        habbo_avatar,
        password_hash,
        is_admin,
        is_verified,
        hotel,
        is_online
    ) VALUES (
        LOWER(username),
        motto,
        avatar,
        password,
        is_admin,
        TRUE,
        hotel,
        FALSE
    ) RETURNING * INTO new_account;
    
    -- Retornar dados da conta criada
    RETURN row_to_json(new_account);
EXCEPTION
    WHEN unique_violation THEN
        -- Se já existe, retornar erro
        RETURN json_build_object('error', 'Usuário já existe');
    WHEN OTHERS THEN
        -- Outros erros
        RETURN json_build_object('error', SQLERRM);
END;
$$;

-- 3. Função para buscar usuário habbo_auth
CREATE OR REPLACE FUNCTION get_habbo_auth_user(username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_data public.habbo_auth;
BEGIN
    -- Buscar usuário
    SELECT * INTO user_data
    FROM public.habbo_auth 
    WHERE habbo_username = LOWER(username);
    
    -- Se não encontrou, retornar null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Retornar dados do usuário
    RETURN row_to_json(user_data);
END;
$$;

-- 4. Função para atualizar usuário habbo_auth
CREATE OR REPLACE FUNCTION update_habbo_auth_user(
    user_id UUID,
    motto TEXT DEFAULT NULL,
    avatar TEXT DEFAULT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_user public.habbo_auth;
BEGIN
    -- Atualizar usuário
    UPDATE public.habbo_auth SET
        habbo_motto = COALESCE(motto, habbo_motto),
        habbo_avatar = COALESCE(avatar, habbo_avatar),
        last_login = COALESCE(last_login, last_login),
        updated_at = NOW()
    WHERE id = user_id
    RETURNING * INTO updated_user;
    
    -- Se não encontrou, retornar erro
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Usuário não encontrado');
    END IF;
    
    -- Retornar dados atualizados
    RETURN row_to_json(updated_user);
END;
$$;

-- 5. Função para verificar senha
CREATE OR REPLACE FUNCTION verify_habbo_auth_password(
    username TEXT,
    password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_data public.habbo_auth;
BEGIN
    -- Buscar usuário
    SELECT * INTO user_data
    FROM public.habbo_auth 
    WHERE habbo_username = LOWER(username);
    
    -- Se não encontrou, retornar erro
    IF NOT FOUND THEN
        RETURN json_build_object('success', FALSE, 'error', 'Usuário não encontrado');
    END IF;
    
    -- Verificar senha
    IF user_data.password_hash = password THEN
        -- Atualizar last_login
        UPDATE public.habbo_auth 
        SET last_login = NOW(), is_online = TRUE, updated_at = NOW()
        WHERE id = user_data.id;
        
        -- Retornar sucesso com dados do usuário
        RETURN json_build_object(
            'success', TRUE, 
            'user', row_to_json(user_data)
        );
    ELSE
        -- Senha incorreta
        RETURN json_build_object('success', FALSE, 'error', 'Senha incorreta');
    END IF;
END;
$$;

-- 6. Comentários para documentação
COMMENT ON FUNCTION check_habbo_auth_exists(TEXT) IS 'Verifica se um usuário existe na tabela habbo_auth';
COMMENT ON FUNCTION create_habbo_auth_account(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS 'Cria uma nova conta na tabela habbo_auth';
COMMENT ON FUNCTION get_habbo_auth_user(TEXT) IS 'Busca dados de um usuário na tabela habbo_auth';
COMMENT ON FUNCTION update_habbo_auth_user(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) IS 'Atualiza dados de um usuário na tabela habbo_auth';
COMMENT ON FUNCTION verify_habbo_auth_password(TEXT, TEXT) IS 'Verifica credenciais de login de um usuário';
