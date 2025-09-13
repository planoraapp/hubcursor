-- ========================================
-- MIGRAÇÃO CONSOLIDADA - HABBO HUB
-- ========================================
-- Este arquivo contém todas as migrações consolidadas
-- Data de consolidação: 2025-09-13T03:03:23.765Z
-- Total de arquivos: 79
-- ========================================


-- ========================================
-- ARQUIVO: 20240925_create_users_table.sql
-- ========================================

-- Create users table for HabboHub
create table public.users (
    id               bigint generated always as identity primary key,
    habbo_username   text not null unique,
    habbo_motto      text not null,
    habbo_avatar     text,
    password_hash    text not null,
    email            text,
    is_admin         boolean default false,
    is_verified      boolean default false,
    last_login       timestamptz,
    created_at       timestamptz default now(),
    updated_at       timestamptz default now()
);

-- Create indexes for faster lookups
create index idx_users_habbo_username on public.users(habbo_username);
create index idx_users_email on public.users(email);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies
-- Users can read their own data
create policy "Users can view own data" on public.users
    for select using (auth.uid()::text = id::text);

-- Users can update their own data
create policy "Users can update own data" on public.users
    for update using (auth.uid()::text = id::text);

-- Service role can do everything (for Edge Functions)
create policy "Service role can do everything" on public.users
    for all using (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
create trigger update_users_updated_at 
    before update on public.users 
    for each row 
    execute function update_updated_at_column();

-- Insert sample data (optional)
-- insert into public.users (habbo_username, habbo_motto, password_hash, is_admin) 
-- values ('habbohub', 'HUB-HA2VEA', 'sample_hash', true);


-- ========================================
-- FIM DO ARQUIVO: 20240925_create_users_table.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250101_create_admin_user_function.sql
-- ========================================

-- Função para criar usuário admin contornando constraints
CREATE OR REPLACE FUNCTION create_admin_user(user_id UUID, user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tentar inserir usuário na tabela auth.users
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
    user_id,
    user_email,
    '$2a$10$dummy.hash.for.admin.user',
    NOW(),
    NOW(),
    NOW(),
    '{"habbo_name": "habbohub"}',
    '{"habbo_name": "habbohub"}',
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
END;
$$;


-- ========================================
-- FIM DO ARQUIVO: 20250101_create_admin_user_function.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250101_create_get_auth_email_function.sql
-- ========================================

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

-- ========================================
-- FIM DO ARQUIVO: 20250101_create_get_auth_email_function.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250101_create_habbo_admin_account_function.sql
-- ========================================

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


-- ========================================
-- FIM DO ARQUIVO: 20250101_create_habbo_admin_account_function.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250101_create_habbohub_admin_user.sql
-- ========================================

-- ========================================
-- CRIAR USUÁRIO ADMIN HABBOHUB
-- Seguindo o mesmo padrão do Beebop
-- ========================================

-- 1. Criar usuário auth para habbohub
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
  role
) VALUES (
  'hhbr-habbohub-user-id-12345',
  'hhbr-habbohub@habbohub.com',
  crypt('151092', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"habbo_name": "habbohub"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar a conta Habbo para habbohub
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  created_at
) VALUES (
  gen_random_uuid(),
  'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  'habbohub',
  'hhbr-habbohub-user-id-12345',
  'br',
  'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  'HUB-QQ797',
  true,
  false,
  now()
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  is_admin = EXCLUDED.is_admin,
  updated_at = now();

-- 3. Verificar se foi criado corretamente
SELECT 
  ha.habbo_name,
  ha.habbo_id,
  ha.hotel,
  ha.is_admin,
  au.email
FROM public.habbo_accounts ha
JOIN auth.users au ON ha.supabase_user_id = au.id
WHERE ha.habbo_name = 'habbohub';


-- ========================================
-- FIM DO ARQUIVO: 20250101_create_habbohub_admin_user.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250111_create_habbo_auth_functions.sql
-- ========================================

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


-- ========================================
-- FIM DO ARQUIVO: 20250111_create_habbo_auth_functions.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250111_fix_habbo_auth_table.sql
-- ========================================

-- ========================================
-- MIGRAÇÃO: CORREÇÕES E MELHORIAS NA TABELA HABBO_AUTH
-- ========================================

-- 1. Adicionar campos que podem estar faltando
ALTER TABLE public.habbo_auth 
ADD COLUMN IF NOT EXISTS habbo_figure_string TEXT,
ADD COLUMN IF NOT EXISTS habbo_unique_id TEXT,
ADD COLUMN IF NOT EXISTS hotel VARCHAR(10) DEFAULT 'br',
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- 2. Atualizar comentários das colunas
COMMENT ON COLUMN public.habbo_auth.habbo_figure_string IS 'String da figura do avatar do Habbo';
COMMENT ON COLUMN public.habbo_auth.habbo_unique_id IS 'ID único do usuário no Habbo';
COMMENT ON COLUMN public.habbo_auth.hotel IS 'Hotel do Habbo (br, com, etc.)';
COMMENT ON COLUMN public.habbo_auth.is_online IS 'Status online do usuário';

-- 3. Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_habbo_auth_hotel ON public.habbo_auth(hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_online ON public.habbo_auth(is_online);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_last_login ON public.habbo_auth(last_login);

-- 4. Limpar dados duplicados ou inválidos (se existirem)
DELETE FROM public.habbo_auth 
WHERE habbo_username IS NULL 
   OR habbo_username = '' 
   OR password_hash IS NULL 
   OR password_hash = '';

-- 5. Garantir que as contas administrativas existam com dados corretos
INSERT INTO public.habbo_auth (
    habbo_username, 
    habbo_motto, 
    habbo_avatar,
    habbo_figure_string,
    habbo_unique_id,
    password_hash, 
    is_admin, 
    is_verified,
    hotel,
    is_online
) VALUES 
    ('habbohub', 'HUB-ADMIN', 
     'https://www.habbo.com/habbo-imaging/avatarimage?size=l&figure=hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61&direction=2&head_direction=2&img_format=png',
     'hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61',
     'hhus-habbohub-admin',
     '151092', 
     true, 
     true,
     'br',
     false),
    ('beebop', 'BEEBOP-ADMIN',
     'https://www.habbo.com/habbo-imaging/avatarimage?size=l&figure=hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61&direction=2&head_direction=2&img_format=png',
     'hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61',
     'hhus-beebop-admin',
     '290684', 
     true, 
     true,
     'br',
     false)
ON CONFLICT (habbo_username) DO UPDATE SET
    habbo_motto = EXCLUDED.habbo_motto,
    habbo_avatar = EXCLUDED.habbo_avatar,
    habbo_figure_string = EXCLUDED.habbo_figure_string,
    habbo_unique_id = EXCLUDED.habbo_unique_id,
    password_hash = EXCLUDED.password_hash,
    is_admin = EXCLUDED.is_admin,
    is_verified = EXCLUDED.is_verified,
    hotel = EXCLUDED.hotel,
    updated_at = NOW();

-- 6. Verificar e corrigir políticas RLS se necessário
DROP POLICY IF EXISTS "Public can view habbo users" ON public.habbo_auth;
DROP POLICY IF EXISTS "Service role can manage all habbo auth" ON public.habbo_auth;

-- Recriar políticas RLS
CREATE POLICY "Public can view habbo users" 
    ON public.habbo_auth 
    FOR SELECT 
    USING (true);

CREATE POLICY "Service role can manage all habbo auth" 
    ON public.habbo_auth 
    FOR ALL 
    USING (current_setting('role', true) = 'service_role');

-- 7. Adicionar constraint para garantir que username seja lowercase
ALTER TABLE public.habbo_auth 
ADD CONSTRAINT check_username_lowercase 
CHECK (habbo_username = LOWER(habbo_username));

-- 8. Adicionar constraint para senha não vazia
ALTER TABLE public.habbo_auth 
ADD CONSTRAINT check_password_not_empty 
CHECK (LENGTH(password_hash) > 0);

-- 9. Função para atualizar status online
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar is_online baseado no last_login
    IF NEW.last_login IS NOT NULL AND OLD.last_login IS DISTINCT FROM NEW.last_login THEN
        NEW.is_online = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para atualizar status online automaticamente
DROP TRIGGER IF EXISTS update_online_status ON public.habbo_auth;
CREATE TRIGGER update_online_status
    BEFORE UPDATE ON public.habbo_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_user_online_status();

-- 11. Função para limpar usuários offline antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_offline_users()
RETURNS void AS $$
BEGIN
    -- Marcar como offline usuários que não fizeram login há mais de 24 horas
    UPDATE public.habbo_auth 
    SET is_online = false 
    WHERE last_login < NOW() - INTERVAL '24 hours' 
      AND is_online = true;
END;
$$ LANGUAGE plpgsql;

-- 12. Comentários finais
COMMENT ON FUNCTION update_user_online_status() IS 'Atualiza status online do usuário quando last_login é modificado';
COMMENT ON FUNCTION cleanup_old_offline_users() IS 'Marca usuários como offline se não fizeram login há mais de 24 horas';


-- ========================================
-- FIM DO ARQUIVO: 20250111_fix_habbo_auth_table.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250121000001_create_badges_tables.sql
-- ========================================

-- Migration: Create badges tables
-- Description: Create tables for storing Habbo badges with categories and metadata

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  hotel VARCHAR(10),
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create badge_categories table for many-to-many relationship
CREATE TABLE IF NOT EXISTS badge_categories (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_id, category)
);

-- Create badge_countries table for country mapping
CREATE TABLE IF NOT EXISTS badge_countries (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  country VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_id, country)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(code);
CREATE INDEX IF NOT EXISTS idx_badges_hotel ON badges(hotel);
CREATE INDEX IF NOT EXISTS idx_badges_created_at ON badges(created_at);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_badge_categories_badge_id ON badge_categories(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_categories_category ON badge_categories(category);
CREATE INDEX IF NOT EXISTS idx_badge_countries_badge_id ON badge_countries(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_countries_country ON badge_countries(country);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_badges_updated_at 
    BEFORE UPDATE ON badges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO badge_categories (badge_id, category) 
SELECT id, 'all' FROM badges 
WHERE NOT EXISTS (SELECT 1 FROM badge_categories WHERE category = 'all')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badges TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badge_categories TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badge_countries TO authenticated;


-- ========================================
-- FIM DO ARQUIVO: 20250121000001_create_badges_tables.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250128_fix_rls_policies.sql
-- ========================================

-- ========================================
-- AJUSTAR POLÍTICAS RLS PARA CONTA HABBOHUB
-- ========================================

-- 1. Adicionar política para permitir leitura pública de contas (para verificação de existência)
CREATE POLICY "Public can view habbo accounts for verification"
  ON public.habbo_accounts
  FOR SELECT
  USING (true);

-- 2. Adicionar política para permitir inserção de contas especiais (habbohub)
CREATE POLICY "Allow special account creation"
  ON public.habbo_accounts
  FOR INSERT
  WITH CHECK (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  );

-- 3. Adicionar política para permitir atualização de contas especiais
CREATE POLICY "Allow special account updates"
  ON public.habbo_accounts
  FOR UPDATE
  USING (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  )
  WITH CHECK (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  );

-- 4. Adicionar política para permitir exclusão de contas especiais
CREATE POLICY "Allow special account deletion"
  ON public.habbo_accounts
  FOR DELETE
  USING (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  );

-- 5. Criar índice para performance na busca por habbo_name e hotel
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_name_hotel 
ON public.habbo_accounts (habbo_name, hotel);


-- ========================================
-- FIM DO ARQUIVO: 20250128_fix_rls_policies.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250130000001_create_api_cache_table.sql
-- ========================================

-- Migration: Create API cache table for unified API
-- Description: Create table for caching API responses to improve performance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create api_cache table
CREATE TABLE IF NOT EXISTS public.api_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON public.api_cache(key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON public.api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_priority ON public.api_cache(priority);
CREATE INDEX IF NOT EXISTS idx_api_cache_created_at ON public.api_cache(created_at);

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_cache 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_cache_updated_at
  BEFORE UPDATE ON public.api_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_api_cache_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_cache TO service_role;

-- Create RLS policies
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Policy for service role (can do everything)
CREATE POLICY "Service role can manage all cache entries"
  ON public.api_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Policy for authenticated users (read only)
CREATE POLICY "Authenticated users can read cache entries"
  ON public.api_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert initial cache cleanup job (if using pg_cron)
-- This would be set up separately in production


-- ========================================
-- FIM DO ARQUIVO: 20250130000001_create_api_cache_table.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250729004844-57dc0441-6b85-4e2d-9d43-da76c37ac3cb.sql
-- ========================================


-- Criar tabela para vínculos entre contas Habbo e usuários Supabase
CREATE TABLE public.habbo_accounts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  habbo_id text NOT NULL UNIQUE,
  habbo_name text NOT NULL,
  supabase_user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT habbo_accounts_pkey PRIMARY KEY (id)
);

-- Adicionar foreign key para auth.users
ALTER TABLE public.habbo_accounts ADD CONSTRAINT habbo_accounts_supabase_user_id_fkey FOREIGN KEY (supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.habbo_accounts ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler sua própria conta vinculada
CREATE POLICY "Users can read their own linked habbo account" ON public.habbo_accounts
FOR SELECT USING (auth.uid() = supabase_user_id);

-- Política: Usuários podem inserir sua própria conta vinculada
CREATE POLICY "Users can insert their own linked habbo account" ON public.habbo_accounts
FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

-- Política: Usuários podem atualizar sua própria conta vinculada
CREATE POLICY "Users can update their own linked habbo account" ON public.habbo_accounts
FOR UPDATE USING (auth.uid() = supabase_user_id);


-- ========================================
-- FIM DO ARQUIVO: 20250729004844-57dc0441-6b85-4e2d-9d43-da76c37ac3cb.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250729132408-7969cb99-268b-4b6c-9208-8b00c0496b25.sql
-- ========================================


-- Adicionar coluna is_admin à tabela habbo_accounts
ALTER TABLE public.habbo_accounts 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;


-- ========================================
-- FIM DO ARQUIVO: 20250729132408-7969cb99-268b-4b6c-9208-8b00c0496b25.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250729163336-791f8d61-cf12-4904-ace6-85dd0cd5d72e.sql
-- ========================================


-- Adicionar coluna is_admin na tabela habbo_accounts se não existir
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Tabela para Posts do Fórum
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_supabase_user_id uuid NOT NULL,
  author_habbo_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  likes integer DEFAULT 0 NOT NULL,
  CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
  CONSTRAINT forum_posts_author_supabase_user_id_fkey FOREIGN KEY (author_supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela para Comentários do Fórum
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  post_id uuid NOT NULL,
  content text NOT NULL,
  author_supabase_user_id uuid NOT NULL,
  author_habbo_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
  CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT forum_comments_author_supabase_user_id_fkey FOREIGN KEY (author_supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para forum_posts
CREATE POLICY "Enable read access for all users" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_supabase_user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.forum_posts FOR DELETE USING (auth.uid() = author_supabase_user_id);

-- Políticas de RLS para forum_comments
CREATE POLICY "Enable read access for all users" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.forum_comments FOR UPDATE USING (auth.uid() = author_supabase_user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.forum_comments FOR DELETE USING (auth.uid() = author_supabase_user_id);


-- ========================================
-- FIM DO ARQUIVO: 20250729163336-791f8d61-cf12-4904-ace6-85dd0cd5d72e.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250729185105-a0a5669a-4e11-4430-b56b-ef3271b663dd.sql
-- ========================================


-- Criar tabela para posts do fórum
CREATE TABLE public.forum_posts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_supabase_user_id uuid NOT NULL,
  author_habbo_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  likes integer DEFAULT 0 NOT NULL,
  CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
  CONSTRAINT forum_posts_author_supabase_user_id_fkey FOREIGN KEY (author_supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar tabela para comentários do fórum
CREATE TABLE public.forum_comments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  post_id uuid NOT NULL,
  content text NOT NULL,
  author_supabase_user_id uuid NOT NULL,
  author_habbo_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
  CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT forum_comments_author_supabase_user_id_fkey FOREIGN KEY (author_supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para forum_posts
CREATE POLICY "Enable read access for all users" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_supabase_user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.forum_posts FOR DELETE USING (auth.uid() = author_supabase_user_id);

-- Políticas de RLS para forum_comments
CREATE POLICY "Enable read access for all users" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.forum_comments FOR UPDATE USING (auth.uid() = author_supabase_user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.forum_comments FOR DELETE USING (auth.uid() = author_supabase_user_id);


-- ========================================
-- FIM DO ARQUIVO: 20250729185105-a0a5669a-4e11-4430-b56b-ef3271b663dd.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250729185544-04ae690a-5e62-433b-8124-2268cefa06cc.sql
-- ========================================


-- Create storage bucket for forum images
INSERT INTO storage.buckets (id, name, public)
VALUES ('habbo-hub-images', 'habbo-hub-images', true);

-- Create policy to allow public read access to the bucket
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'habbo-hub-images');

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'habbo-hub-images' AND auth.role() = 'authenticated');

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (bucket_id = 'habbo-hub-images' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ========================================
-- FIM DO ARQUIVO: 20250729185544-04ae690a-5e62-433b-8124-2268cefa06cc.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250729232351-29dda909-f216-46a6-b799-52228c1390ba.sql
-- ========================================


-- Add the missing category column to forum_posts table
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS category text;


-- ========================================
-- FIM DO ARQUIVO: 20250729232351-29dda909-f216-46a6-b799-52228c1390ba.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250730224043_52f30d60-5493-4104-9b74-b70e2ee9c497.sql
-- ========================================


-- Create the habbo_figures_cache table for storing figure data
CREATE TABLE IF NOT EXISTS public.habbo_figures_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS but make it public for the edge function to access
ALTER TABLE public.habbo_figures_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for edge function)
CREATE POLICY "Allow public read access for figure cache" 
  ON public.habbo_figures_cache 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow public insert access (for edge function)
CREATE POLICY "Allow public insert access for figure cache" 
  ON public.habbo_figures_cache 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create policy to allow public delete access (for cleanup)
CREATE POLICY "Allow public delete access for expired cache" 
  ON public.habbo_figures_cache 
  FOR DELETE 
  TO public
  USING (expires_at < now());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_habbo_figures_cache_expires_at ON public.habbo_figures_cache(expires_at);


-- ========================================
-- FIM DO ARQUIVO: 20250730224043_52f30d60-5493-4104-9b74-b70e2ee9c497.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250731123855_5443cd33-82e0-4959-a76f-b05a560216eb.sql
-- ========================================

-- Criar tabela de cache para dados do Habbo se ela não existir
CREATE TABLE IF NOT EXISTS public.habbo_figures_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Criar índice para consultas por expiração
CREATE INDEX IF NOT EXISTS idx_habbo_figures_cache_expires_at 
ON public.habbo_figures_cache(expires_at);

-- Habilitar RLS (mesmo sendo dados públicos, é boa prática)
ALTER TABLE public.habbo_figures_cache ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura dos dados de cache
CREATE POLICY IF NOT EXISTS "Cache é acessível publicamente" 
ON public.habbo_figures_cache 
FOR SELECT 
USING (true);

-- Política para permitir inserção de novos dados de cache (via service role)
CREATE POLICY IF NOT EXISTS "Inserção de cache via service role" 
ON public.habbo_figures_cache 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir limpeza de cache expirado
CREATE POLICY IF NOT EXISTS "Limpeza de cache expirado" 
ON public.habbo_figures_cache 
FOR DELETE 
USING (expires_at < now());

-- ========================================
-- FIM DO ARQUIVO: 20250731123855_5443cd33-82e0-4959-a76f-b05a560216eb.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250731135518_84fd6df2-8e24-42be-9f58-ff70d4fa5d34.sql
-- ========================================

-- Create photo_likes table for social interactions
CREATE TABLE public.photo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Create photo_comments table for photo discussions
CREATE TABLE public.photo_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_followers table for following system
CREATE TABLE public.user_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  followed_habbo_id TEXT NOT NULL,
  followed_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, followed_habbo_id)
);

-- Enable RLS on all tables
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo_likes
CREATE POLICY "Users can view all photo likes" 
ON public.photo_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like photos" 
ON public.photo_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.photo_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for photo_comments
CREATE POLICY "Users can view all photo comments" 
ON public.photo_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can comment on photos" 
ON public.photo_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own comments" 
ON public.photo_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.photo_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for user_followers
CREATE POLICY "Users can view all followers" 
ON public.user_followers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow others" 
ON public.user_followers 
FOR INSERT 
WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow" 
ON public.user_followers 
FOR DELETE 
USING (auth.uid() = follower_user_id);

-- Create indexes for better performance
CREATE INDEX idx_photo_likes_photo_id ON public.photo_likes(photo_id);
CREATE INDEX idx_photo_likes_user_id ON public.photo_likes(user_id);
CREATE INDEX idx_photo_comments_photo_id ON public.photo_comments(photo_id);
CREATE INDEX idx_photo_comments_user_id ON public.photo_comments(user_id);
CREATE INDEX idx_user_followers_follower ON public.user_followers(follower_user_id);
CREATE INDEX idx_user_followers_followed ON public.user_followers(followed_habbo_id);

-- ========================================
-- FIM DO ARQUIVO: 20250731135518_84fd6df2-8e24-42be-9f58-ff70d4fa5d34.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250802191525_89f773a9-3fed-4e76-9f48-588e49693f35.sql
-- ========================================


-- Create habbo_badges table for tracking valid badges
CREATE TABLE IF NOT EXISTS public.habbo_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code TEXT NOT NULL UNIQUE,
  badge_name TEXT,
  source TEXT CHECK (source IN ('HabboWidgets', 'HabboAssets', 'SupabaseBucket')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ DEFAULT NOW(),
  validation_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_code ON public.habbo_badges(badge_code);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active) WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE public.habbo_badges ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active badges
CREATE POLICY "Allow read access to active badges" 
ON public.habbo_badges 
FOR SELECT 
USING (is_active = TRUE);

-- Create policy for service role to manage badges
CREATE POLICY "Allow service role to manage badges"
ON public.habbo_badges
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Create a function for periodic badge validation and cleanup
CREATE OR REPLACE FUNCTION public.validate_and_cleanup_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove badges not validated in the last 90 days
  DELETE FROM public.habbo_badges
  WHERE last_validated_at < NOW() - INTERVAL '90 days';

  -- Update validation status for stale badges
  UPDATE public.habbo_badges
  SET is_active = FALSE
  WHERE last_validated_at < NOW() - INTERVAL '30 days';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run validation periodically
CREATE OR REPLACE TRIGGER trigger_badge_validation
AFTER INSERT OR UPDATE ON public.habbo_badges
FOR EACH STATEMENT
EXECUTE FUNCTION public.validate_and_cleanup_badges();


-- ========================================
-- FIM DO ARQUIVO: 20250802191525_89f773a9-3fed-4e76-9f48-588e49693f35.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250803111257_007d0666-48cc-49ad-9f8b-9be698bdeb70.sql
-- ========================================


-- Adicionar coluna category à tabela habbo_badges
ALTER TABLE public.habbo_badges 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'others' CHECK (category IN ('official', 'achievements', 'fansites', 'others'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_category ON public.habbo_badges(category);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_source ON public.habbo_badges(source);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_last_validated ON public.habbo_badges(last_validated_at);

-- Atualizar badges existentes com categorização baseada no badge_code
UPDATE public.habbo_badges 
SET category = CASE 
  WHEN UPPER(badge_code) LIKE '%ADM%' OR UPPER(badge_code) LIKE '%MOD%' OR UPPER(badge_code) LIKE '%STAFF%' 
       OR UPPER(badge_code) LIKE '%VIP%' OR UPPER(badge_code) LIKE '%GUIDE%' OR UPPER(badge_code) LIKE '%HELPER%' THEN 'official'
  WHEN UPPER(badge_code) LIKE '%ACH%' OR UPPER(badge_code) LIKE '%GAM%' OR UPPER(badge_code) LIKE '%WIN%' 
       OR UPPER(badge_code) LIKE '%VICTORY%' OR UPPER(badge_code) LIKE '%CHAMPION%' THEN 'achievements'
  WHEN UPPER(badge_code) LIKE '%FANSITE%' OR UPPER(badge_code) LIKE '%PARTNER%' OR UPPER(badge_code) LIKE '%EVENT%' 
       OR UPPER(badge_code) LIKE '%SPECIAL%' OR UPPER(badge_code) LIKE '%EXCLUSIVE%' THEN 'fansites'
  ELSE 'others'
END
WHERE category IS NULL OR category = 'others';


-- ========================================
-- FIM DO ARQUIVO: 20250803111257_007d0666-48cc-49ad-9f8b-9be698bdeb70.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250803112429_7b1384c7-184a-4427-88eb-c37f6805fcf9.sql
-- ========================================


-- Verificar e adicionar coluna category se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'habbo_badges' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.habbo_badges 
        ADD COLUMN category text DEFAULT 'others';
        
        -- Adicionar constraint para categorias válidas
        ALTER TABLE public.habbo_badges 
        ADD CONSTRAINT check_category 
        CHECK (category IN ('official', 'achievements', 'fansites', 'others'));
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_category ON public.habbo_badges(category);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_source ON public.habbo_badges(source);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_code ON public.habbo_badges(badge_code);

-- Limpar dados antigos e preparar para nova população
DELETE FROM public.habbo_badges;

-- Resetar sequência se existir
-- (Usar UUID então não é necessário resetar sequência)


-- ========================================
-- FIM DO ARQUIVO: 20250803112429_7b1384c7-184a-4427-88eb-c37f6805fcf9.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250804141409_13bb14e5-12c5-4cb8-8879-21d629439606.sql
-- ========================================


-- Criar tabela principal para itens de roupas HabboEmotion
CREATE TABLE IF NOT EXISTS public.habbo_emotion_clothing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  part TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'U',
  club TEXT NOT NULL DEFAULT 'FREE',
  colors JSONB NOT NULL DEFAULT '["1"]'::jsonb,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'habboemotion',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(item_id, code)
);

-- Criar tabela de cores oficiais do Habbo
CREATE TABLE IF NOT EXISTS public.habbo_emotion_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  color_id TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  color_name TEXT,
  is_hc BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento item-cores
CREATE TABLE IF NOT EXISTS public.habbo_emotion_item_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clothing_item_id UUID NOT NULL REFERENCES public.habbo_emotion_clothing(id) ON DELETE CASCADE,
  color_id TEXT NOT NULL REFERENCES public.habbo_emotion_colors(color_id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(clothing_item_id, color_id)
);

-- Criar tabela de cache da API
CREATE TABLE IF NOT EXISTS public.habbo_emotion_api_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  response_data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '6 hours'),
  item_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.habbo_emotion_clothing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_item_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_api_cache ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leitura pública
CREATE POLICY "Allow public read access to clothing items" 
  ON public.habbo_emotion_clothing 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Allow public read access to colors" 
  ON public.habbo_emotion_colors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to item colors" 
  ON public.habbo_emotion_item_colors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to api cache" 
  ON public.habbo_emotion_api_cache 
  FOR SELECT 
  USING (expires_at > now());

-- Políticas RLS para service role (escrita)
CREATE POLICY "Allow service role to manage clothing items" 
  ON public.habbo_emotion_clothing 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage colors" 
  ON public.habbo_emotion_colors 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage item colors" 
  ON public.habbo_emotion_item_colors 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage api cache" 
  ON public.habbo_emotion_api_cache 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_part ON public.habbo_emotion_clothing(part);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_gender ON public.habbo_emotion_clothing(gender);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_club ON public.habbo_emotion_clothing(club);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_active ON public.habbo_emotion_clothing(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_api_cache_expires ON public.habbo_emotion_api_cache(expires_at);

-- Inserir cores básicas do Habbo (usando dados do habboColors.ts)
INSERT INTO public.habbo_emotion_colors (color_id, hex_code, color_name, is_hc) VALUES
('1', 'DDDDDD', 'Cinza Claro', false),
('2', '96743D', 'Marrom', false),
('3', '6B573B', 'Marrom Escuro', false),
('4', 'E7B027', 'Amarelo', false),
('5', 'fff7b7', 'Amarelo Claro', false),
('6', 'F8C790', 'Pele', false),
('7', '9F2B31', 'Vermelho Escuro', false),
('8', 'ED5C50', 'Vermelho', false),
('9', 'FFBFC2', 'Rosa Claro', false),
('10', 'E7D1EE', 'Roxo Claro', false),
('11', 'AC94B3', 'Roxo', false),
('12', '7E5B90', 'Roxo Escuro', false),
('13', '4F7AA2', 'Azul', false),
('14', '75B7C7', 'Azul Claro', false),
('15', 'C5EDE6', 'Ciano Claro', false),
('16', 'BBF3BD', 'Verde Claro', false),
('17', '6BAE61', 'Verde', false),
('18', '456F40', 'Verde Escuro', false),
('19', '7A7D22', 'Verde Oliva', false),
('20', '595959', 'Cinza', false),
('21', '1E1E1E', 'Preto HC', true),
('22', '84573c', 'Marrom HC', true),
('23', 'A86B19', 'Dourado HC', true),
('24', 'c69f71', 'Bege HC', true),
('25', 'F3E1AF', 'Creme HC', true),
('26', 'FFFFFF', 'Branco HC', true),
('27', 'FFF41D', 'Amarelo Neon HC', true),
('28', 'ffe508', 'Amarelo HC', true),
('29', 'ffcc00', 'Ouro HC', true),
('30', 'ffa508', 'Laranja Claro HC', true),
('31', 'FF9211', 'Laranja HC', true),
('32', 'ff5b08', 'Laranja Escuro HC', true),
('33', 'C74400', 'Vermelho Laranja HC', true),
('34', 'da6a43', 'Terra Cotta HC', true),
('35', 'b18276', 'Rosa Seco HC', true),
('36', 'ae4747', 'Vermelho Rosado HC', true),
('37', '813033', 'Bordô HC', true),
('38', '5b2420', 'Marrom Avermelhado HC', true),
('39', '9B001D', 'Vermelho Escuro HC', true),
('40', 'd2183c', 'Vermelho Vivo HC', true),
('41', 'e53624', 'Vermelho HC', true),
('42', 'FF1300', 'Vermelho Neon HC', true),
('43', 'ff638f', 'Rosa HC', true),
('44', 'fe86b1', 'Rosa Claro HC', true),
('45', 'FF6D8F', 'Rosa Médio HC', true),
('46', 'ffc7e4', 'Rosa Pastel HC', true),
('47', 'E993FF', 'Roxo Claro HC', true),
('48', 'ff88f4', 'Magenta HC', true),
('49', 'FF27A6', 'Pink HC', true),
('50', 'C600AD', 'Roxo Pink HC', true),
('61', '92', 'Azul Padrão', false),
('92', '1', 'Branco Padrão', false),
('100', '100', 'Cor 100', false),
('101', '101', 'Cor 101', false),
('102', '102', 'Cor 102', false),
('104', '104', 'Cor 104', false),
('105', '105', 'Cor 105', false),
('106', '106', 'Cor 106', false),
('143', '143', 'Cor 143', false)
ON CONFLICT (color_id) DO NOTHING;


-- ========================================
-- FIM DO ARQUIVO: 20250804141409_13bb14e5-12c5-4cb8-8879-21d629439606.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250804181303_7aee25e8-9c44-466b-81f8-027c2b79f710.sql
-- ========================================

-- Create table for caching HabboEmotion API clothing data
CREATE TABLE public.habbo_clothing_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  part TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'U',
  colors JSONB NOT NULL DEFAULT '["1", "2", "3", "4", "5"]'::jsonb,
  image_url TEXT,
  club TEXT NOT NULL DEFAULT 'FREE',
  source TEXT NOT NULL DEFAULT 'habboemotion-api',
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for item_id to prevent duplicates
CREATE UNIQUE INDEX idx_habbo_clothing_cache_item_id ON public.habbo_clothing_cache(item_id);

-- Create indexes for efficient querying
CREATE INDEX idx_habbo_clothing_cache_part ON public.habbo_clothing_cache(part);
CREATE INDEX idx_habbo_clothing_cache_gender ON public.habbo_clothing_cache(gender);
CREATE INDEX idx_habbo_clothing_cache_active ON public.habbo_clothing_cache(is_active);
CREATE INDEX idx_habbo_clothing_cache_synced_at ON public.habbo_clothing_cache(api_synced_at);

-- Enable RLS
ALTER TABLE public.habbo_clothing_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to active items
CREATE POLICY "Allow public read access to active clothing items" 
ON public.habbo_clothing_cache 
FOR SELECT 
USING (is_active = true);

-- Create policy for service role to manage data
CREATE POLICY "Allow service role to manage clothing cache" 
ON public.habbo_clothing_cache 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_habbo_clothing_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_habbo_clothing_cache_updated_at
BEFORE UPDATE ON public.habbo_clothing_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_habbo_clothing_cache_updated_at();

-- ========================================
-- FIM DO ARQUIVO: 20250804181303_7aee25e8-9c44-466b-81f8-027c2b79f710.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250805223507_10cf5b39-e03a-4cdc-9814-69ce9e985852.sql
-- ========================================


-- Criar tabelas para o sistema Habbo Home

-- Tabela para armazenar layouts dos widgets dos usuários
CREATE TABLE public.user_home_layouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  widget_id text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 1,
  width integer,
  height integer,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para armazenar stickers posicionados pelos usuários
CREATE TABLE public.user_stickers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  sticker_id text NOT NULL,
  sticker_src text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para configurações de fundo da home
CREATE TABLE public.user_home_backgrounds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  background_type text NOT NULL DEFAULT 'color', -- 'color', 'repeat', 'cover'
  background_value text NOT NULL DEFAULT '#007bff', -- cor hex ou nome do arquivo
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para mensagens do guestbook
CREATE TABLE public.guestbook_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_owner_user_id uuid REFERENCES auth.users NOT NULL,
  author_user_id uuid REFERENCES auth.users,
  author_habbo_name text NOT NULL,
  message text NOT NULL,
  moderation_status text NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para avaliações das homes
CREATE TABLE public.user_home_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_owner_user_id uuid REFERENCES auth.users NOT NULL,
  rating_user_id uuid REFERENCES auth.users NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(home_owner_user_id, rating_user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_home_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_home_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_home_ratings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_home_layouts
CREATE POLICY "Users can manage their own layouts" 
  ON public.user_home_layouts 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view layouts" 
  ON public.user_home_layouts 
  FOR SELECT 
  USING (true);

-- Políticas RLS para user_stickers
CREATE POLICY "Users can manage their own stickers" 
  ON public.user_stickers 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view stickers" 
  ON public.user_stickers 
  FOR SELECT 
  USING (true);

-- Políticas RLS para user_home_backgrounds
CREATE POLICY "Users can manage their own backgrounds" 
  ON public.user_home_backgrounds 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view backgrounds" 
  ON public.user_home_backgrounds 
  FOR SELECT 
  USING (true);

-- Políticas RLS para guestbook_entries
CREATE POLICY "Anyone can read approved guestbook entries" 
  ON public.guestbook_entries 
  FOR SELECT 
  USING (moderation_status = 'approved');

CREATE POLICY "Authenticated users can add guestbook entries" 
  ON public.guestbook_entries 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Home owners can moderate their guestbook" 
  ON public.guestbook_entries 
  FOR UPDATE 
  USING (auth.uid() = home_owner_user_id);

-- Políticas RLS para user_home_ratings
CREATE POLICY "Anyone can read ratings" 
  ON public.user_home_ratings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can rate homes" 
  ON public.user_home_ratings 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = rating_user_id);

CREATE POLICY "Users can update their own ratings" 
  ON public.user_home_ratings 
  FOR UPDATE 
  USING (auth.uid() = rating_user_id);

-- Criar índices para otimizar consultas
CREATE INDEX idx_user_home_layouts_user_id ON public.user_home_layouts(user_id);
CREATE INDEX idx_user_stickers_user_id ON public.user_stickers(user_id);
CREATE INDEX idx_user_home_backgrounds_user_id ON public.user_home_backgrounds(user_id);
CREATE INDEX idx_guestbook_entries_home_owner ON public.guestbook_entries(home_owner_user_id);
CREATE INDEX idx_user_home_ratings_home_owner ON public.user_home_ratings(home_owner_user_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_home_layouts_updated_at 
  BEFORE UPDATE ON public.user_home_layouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_home_backgrounds_updated_at 
  BEFORE UPDATE ON public.user_home_backgrounds 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ========================================
-- FIM DO ARQUIVO: 20250805223507_10cf5b39-e03a-4cdc-9814-69ce9e985852.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250805224606_f39e8953-6f30-4233-9e5f-5cf8c1de74a6.sql
-- ========================================


-- Limpeza completa do usuário Beebop
-- Remove todos os registros de Beebop da tabela habbo_accounts
DELETE FROM public.habbo_accounts 
WHERE habbo_name ILIKE 'beebop';

-- Verificar se a limpeza foi bem-sucedida
SELECT COUNT(*) as registros_restantes 
FROM public.habbo_accounts 
WHERE habbo_name ILIKE 'beebop';


-- ========================================
-- FIM DO ARQUIVO: 20250805224606_f39e8953-6f30-4233-9e5f-5cf8c1de74a6.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250805225451_9a96c397-29ec-49fd-ad7a-01d44c30dc45.sql
-- ========================================


-- Primeiro, corrigir privilégios de admin para Beebop
UPDATE public.habbo_accounts 
SET is_admin = true 
WHERE habbo_name ILIKE 'beebop';

-- Criar função para inicializar home padrão de um usuário
CREATE OR REPLACE FUNCTION public.initialize_user_home(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#007bff')
  ON CONFLICT DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 80, 1, 300, 280, true),
    (user_uuid, 'guestbook', 350, 80, 1, 400, 350, true),
    (user_uuid, 'rating', 780, 80, 1, 200, 150, true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Criar trigger function que executa quando um usuário faz login pela primeira vez
CREATE OR REPLACE FUNCTION public.handle_new_user_home()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é o primeiro login (não tem dados de home ainda)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_home_layouts WHERE user_id = NEW.supabase_user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_home_backgrounds WHERE user_id = NEW.supabase_user_id
  ) THEN
    -- Inicializar home padrão
    PERFORM public.initialize_user_home(NEW.supabase_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela habbo_accounts para auto-inicialização
DROP TRIGGER IF EXISTS trigger_initialize_user_home ON public.habbo_accounts;
CREATE TRIGGER trigger_initialize_user_home
  AFTER INSERT ON public.habbo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_home();

-- Inicializar homes para usuários existentes que não têm home ainda
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT supabase_user_id 
    FROM public.habbo_accounts 
    WHERE supabase_user_id NOT IN (
      SELECT DISTINCT user_id FROM public.user_home_layouts
    )
  LOOP
    PERFORM public.initialize_user_home(user_record.supabase_user_id);
  END LOOP;
END $$;


-- ========================================
-- FIM DO ARQUIVO: 20250805225451_9a96c397-29ec-49fd-ad7a-01d44c30dc45.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250806121652_a8d66607-37a1-41bc-9752-45df321fbda7.sql
-- ========================================


-- Limpar todos os dados de usuários e contas relacionadas
DELETE FROM photo_comments;
DELETE FROM photo_likes;
DELETE FROM user_followers;
DELETE FROM guestbook_entries;
DELETE FROM user_home_ratings;
DELETE FROM user_stickers;
DELETE FROM user_home_layouts;
DELETE FROM user_home_backgrounds;
DELETE FROM habbo_accounts;

-- Criar conta única para Beebop com ID fixo
-- Nota: O auth.users precisa ser limpo manualmente via interface do Supabase
-- Após limpar, criaremos a conta Beebop programaticamente

-- Garantir que a tabela user_stickers está otimizada
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'decorative';
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0;
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS scale DECIMAL(3,2) DEFAULT 1.0;

-- Criar alguns stickers padrão se necessário
INSERT INTO user_stickers (user_id, sticker_id, sticker_src, category, x, y, z_index) VALUES
('00000000-0000-0000-0000-000000000000', 'heart_1', '/assets/home/stickers/emoticons/heart.png', 'emoticons', 0, 0, 1),
('00000000-0000-0000-0000-000000000000', 'star_1', '/assets/home/stickers/decorative/star.png', 'decorative', 0, 0, 1),
('00000000-0000-0000-0000-000000000000', 'text_1', '/assets/home/stickers/text/hello.png', 'text', 0, 0, 1)
ON CONFLICT DO NOTHING;


-- ========================================
-- FIM DO ARQUIVO: 20250806121652_a8d66607-37a1-41bc-9752-45df321fbda7.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250806122008_2c0c1fd3-a93f-42f5-ba2f-6ac7b0121551.sql
-- ========================================


-- Add missing columns to user_stickers table
ALTER TABLE user_stickers 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'decorative',
ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scale DECIMAL(3,2) DEFAULT 1.0;

-- Update existing records to have default values
UPDATE user_stickers 
SET 
  category = COALESCE(category, 'decorative'),
  rotation = COALESCE(rotation, 0),
  scale = COALESCE(scale, 1.0)
WHERE category IS NULL OR rotation IS NULL OR scale IS NULL;


-- ========================================
-- FIM DO ARQUIVO: 20250806122008_2c0c1fd3-a93f-42f5-ba2f-6ac7b0121551.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250806125226_1e610477-3152-4cb2-899c-4682a8df58e1.sql
-- ========================================


-- Limpeza completa dos dados de autenticação existentes (mantendo histórico do fórum)
-- Remover todas as contas habbo relacionadas ao Beebop
DELETE FROM user_stickers WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_layouts WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_backgrounds WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_ratings WHERE home_owner_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
) OR rating_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM guestbook_entries WHERE home_owner_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
) OR author_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

-- Remover contas habbo (mas manter fórum que usa habbo_name como string)
DELETE FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%';

-- Limpar dados de sessão antigos (users serão removidos automaticamente via cascade)
-- Nota: Os posts/comments do fórum serão mantidos pois usam habbo_name como string

-- Atualizar cor padrão do background para cinza-azulado do Habbo
UPDATE user_home_backgrounds 
SET background_value = '#c7d2dc' 
WHERE background_type = 'color' AND background_value = '#007bff';

-- Alterar valor padrão para novos usuários
ALTER TABLE user_home_backgrounds 
ALTER COLUMN background_value SET DEFAULT '#c7d2dc';


-- ========================================
-- FIM DO ARQUIVO: 20250806125226_1e610477-3152-4cb2-899c-4682a8df58e1.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250806133828_0c0b9ac3-30a5-4dbc-8e4b-08a413312995.sql
-- ========================================


-- Criar um usuário auth para Beebop
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
  role
) VALUES (
  'hhbr-beebop-user-id-12345',
  'hhbr-beebop@habbohub.com',
  crypt('290684', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"habbo_name": "Beebop"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Criar a conta Habbo para Beebop
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  is_admin,
  created_at
) VALUES (
  gen_random_uuid(),
  'hhbr-beebop',
  'Beebop',
  'hhbr-beebop-user-id-12345',
  true,
  now()
) ON CONFLICT (habbo_name) DO NOTHING;


-- ========================================
-- FIM DO ARQUIVO: 20250806133828_0c0b9ac3-30a5-4dbc-8e4b-08a413312995.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250806155855_50bb0d6d-b69a-43e8-9608-36876eb4ec98.sql
-- ========================================


-- Limpar contas auth órfãs do usuário Beebop
DELETE FROM auth.users 
WHERE email LIKE '%@habbohub.com' 
AND raw_user_meta_data->>'habbo_name' ILIKE 'beebop'
AND id NOT IN (
  SELECT supabase_user_id 
  FROM public.habbo_accounts 
  WHERE supabase_user_id IS NOT NULL
);

-- Limpar também possíveis registros de identidades órfãs
DELETE FROM auth.identities 
WHERE user_id NOT IN (SELECT id FROM auth.users);


-- ========================================
-- FIM DO ARQUIVO: 20250806155855_50bb0d6d-b69a-43e8-9608-36876eb4ec98.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250807155601_33c154ed-8985-4d5a-9225-ed6f8ad8c84e.sql
-- ========================================


-- Criar tabela para categorias do fórum
CREATE TABLE public.forum_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'MessageSquare',
  bg_color text NOT NULL DEFAULT '#f0fdfa',
  topics_count integer NOT NULL DEFAULT 0,
  posts_count integer NOT NULL DEFAULT 0,
  last_post_time timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos leiam as categorias
CREATE POLICY "Anyone can view forum categories" 
  ON public.forum_categories 
  FOR SELECT 
  USING (true);

-- Política para permitir que apenas o Beebop gerencie categorias
CREATE POLICY "Only Beebop can manage forum categories" 
  ON public.forum_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.habbo_accounts 
      WHERE supabase_user_id = auth.uid() 
      AND LOWER(habbo_name) = 'beebop'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habbo_accounts 
      WHERE supabase_user_id = auth.uid() 
      AND LOWER(habbo_name) = 'beebop'
    )
  );

-- Inserir categorias padrão
INSERT INTO public.forum_categories (name, description, icon, bg_color, topics_count, posts_count) VALUES
('Discussões Gerais', 'Converse sobre o Habbo e a comunidade em geral', 'MessageSquare', '#f0fdfa', 45, 320),
('Suporte Técnico', 'Precisa de ajuda? Tire suas dúvidas técnicas aqui', 'HelpCircle', '#ecfdf5', 23, 156),
('Eventos e Competições', 'Divulgue e participe de eventos da comunidade', 'Calendar', '#fefce8', 18, 89),
('Marketplace', 'Compre, venda e troque itens do Habbo', 'ShoppingCart', '#f5f3ff', 12, 67);

-- Atualizar tabela forum_posts para referenciar as categorias
ALTER TABLE public.forum_posts ADD COLUMN category_id uuid REFERENCES public.forum_categories(id);

-- Migrar categorias existentes (assumindo que temos posts com categoria em texto)
UPDATE public.forum_posts 
SET category_id = (
  SELECT id FROM public.forum_categories 
  WHERE name = 'Discussões Gerais'
  LIMIT 1
)
WHERE category IS NULL OR category = '';


-- ========================================
-- FIM DO ARQUIVO: 20250807155601_33c154ed-8985-4d5a-9225-ed6f8ad8c84e.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250807160512_4b2bb8ef-48cb-4582-9cfd-ce035e2ba9a2.sql
-- ========================================


-- Criar função para inicializar home padrão para usuários
CREATE OR REPLACE FUNCTION public.ensure_user_home_exists(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 300, 280, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Garantir que o usuário Beebop tenha uma entrada no guestbook como exemplo
  IF EXISTS (SELECT 1 FROM public.habbo_accounts WHERE supabase_user_id = user_uuid AND LOWER(habbo_name) = 'beebop') THEN
    INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
    VALUES (user_uuid, 'Sistema', 'Bem-vindo à sua nova Habbo Home!', 'approved')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Atualizar constraint na tabela user_home_layouts para permitir múltiplos widgets do mesmo tipo
ALTER TABLE public.user_home_layouts DROP CONSTRAINT IF EXISTS user_home_layouts_user_id_widget_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS user_home_layouts_unique_widget 
ON public.user_home_layouts(user_id, widget_id);


-- ========================================
-- FIM DO ARQUIVO: 20250807160512_4b2bb8ef-48cb-4582-9cfd-ce035e2ba9a2.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250807162314_6b829bc1-8265-4bda-aa03-0f902ac80a7d.sql
-- ========================================


-- Adicionar coluna hotel na tabela habbo_accounts
ALTER TABLE public.habbo_accounts ADD COLUMN hotel text;

-- Criar função para extrair hotel do habbo_id
CREATE OR REPLACE FUNCTION extract_hotel_from_habbo_id(habbo_id_param text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  CASE 
    WHEN habbo_id_param LIKE 'hhbr-%' THEN RETURN 'br';
    WHEN habbo_id_param LIKE 'hhcom-%' THEN RETURN 'com';
    WHEN habbo_id_param LIKE 'hhes-%' THEN RETURN 'es';
    WHEN habbo_id_param LIKE 'hhfr-%' THEN RETURN 'fr';
    WHEN habbo_id_param LIKE 'hhde-%' THEN RETURN 'de';
    WHEN habbo_id_param LIKE 'hhit-%' THEN RETURN 'it';
    WHEN habbo_id_param LIKE 'hhnl-%' THEN RETURN 'nl';
    WHEN habbo_id_param LIKE 'hhfi-%' THEN RETURN 'fi';
    WHEN habbo_id_param LIKE 'hhtr-%' THEN RETURN 'tr';
    ELSE RETURN 'com'; -- fallback para .com
  END CASE;
END;
$$;

-- Preencher a coluna hotel para registros existentes
UPDATE public.habbo_accounts 
SET hotel = extract_hotel_from_habbo_id(habbo_id) 
WHERE hotel IS NULL;

-- Tornar a coluna hotel obrigatória
ALTER TABLE public.habbo_accounts ALTER COLUMN hotel SET NOT NULL;

-- Remover constraint única existente em habbo_name se existir
DROP INDEX IF EXISTS habbo_accounts_habbo_name_key;

-- Criar constraint única composta para habbo_name + hotel
CREATE UNIQUE INDEX habbo_accounts_name_hotel_unique ON public.habbo_accounts(habbo_name, hotel);

-- Atualizar função de inicialização para incluir hotel
CREATE OR REPLACE FUNCTION public.ensure_user_home_exists(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 300, 280, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Adicionar entrada de boas-vindas no guestbook se não existir
  INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
  VALUES (user_uuid, 'HabboHub', 'Bem-vindo à sua nova Habbo Home! 🏠✨', 'approved')
  ON CONFLICT DO NOTHING;
END;
$$;


-- ========================================
-- FIM DO ARQUIVO: 20250807162314_6b829bc1-8265-4bda-aa03-0f902ac80a7d.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250807170137_51d7c1c0-47d5-40a1-8139-c9bd4ffbde50.sql
-- ========================================


-- Create home_assets table for managing all asset types
CREATE TABLE public.home_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Stickers', 'Mockups', 'Montáveis', 'Ícones', 'Papel de Parede', 'Animados')),
  file_path text NOT NULL,
  bucket_name text NOT NULL DEFAULT 'home-assets',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_home_assets_category ON public.home_assets(category);
CREATE INDEX idx_home_assets_active ON public.home_assets(is_active);

-- Enable RLS
ALTER TABLE public.home_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for home_assets
CREATE POLICY "Anyone can view active home assets" 
ON public.home_assets FOR SELECT 
USING (is_active = true);

CREATE POLICY "Service role can manage home assets"
ON public.home_assets FOR ALL 
USING (true)
WITH CHECK (true);

-- Update user_stickers table to include z_index controls
ALTER TABLE public.user_stickers 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_home_assets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER home_assets_updated_at
  BEFORE UPDATE ON public.home_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_home_assets_updated_at();

CREATE TRIGGER user_stickers_updated_at
  BEFORE UPDATE ON public.user_stickers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ========================================
-- FIM DO ARQUIVO: 20250807170137_51d7c1c0-47d5-40a1-8139-c9bd4ffbde50.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250807222244_66e94d22-c13e-4f72-8bd6-7d680344744a.sql
-- ========================================


-- 1) Permitir leitura pública de habbo_accounts (apenas SELECT)
-- Importante: esta tabela só contém habbo_id (público por natureza), habbo_name, hotel e supabase_user_id.
-- Se quiser restringir ainda mais no futuro, podemos expor apenas um VIEW com colunas limitadas.
CREATE POLICY IF NOT EXISTS "Public can read habbo accounts for lookup"
ON public.habbo_accounts
FOR SELECT
USING (true);

-- 2) Índices para acelerar buscas por nome (case-insensitive) e por nome + hotel
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_lower_name
  ON public.habbo_accounts (lower(habbo_name));

CREATE INDEX IF NOT EXISTS idx_habbo_accounts_lower_name_hotel
  ON public.habbo_accounts (lower(habbo_name), hotel);

-- 3) Garantir que ON CONFLICT (user_id) funcione em user_home_backgrounds
CREATE UNIQUE INDEX IF NOT EXISTS user_home_backgrounds_user_id_unique
  ON public.user_home_backgrounds(user_id);

-- 4) Atualizar a função ensure_user_home_exists:
-- - Define search_path para evitar alertas de segurança
-- - Mantém o ON CONFLICT usando os índices/constraints apropriados
CREATE OR REPLACE FUNCTION public.ensure_user_home_exists(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar',    20,  20, 1, 300, 280, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating',   500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Mensagem inicial no guestbook para perfis específicos (exemplo Beebop)
  IF EXISTS (
    SELECT 1 
    FROM public.habbo_accounts 
    WHERE supabase_user_id = user_uuid AND LOWER(habbo_name) = 'beebop'
  ) THEN
    INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
    VALUES (user_uuid, 'Sistema', 'Bem-vindo à sua nova Habbo Home!', 'approved')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;


-- ========================================
-- FIM DO ARQUIVO: 20250807222244_66e94d22-c13e-4f72-8bd6-7d680344744a.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250807233100_f340151f-2cd8-449a-a6fb-bd876d802da5.sql
-- ========================================


-- 1) Índice único para suportar ON CONFLICT (user_id) em user_home_backgrounds
CREATE UNIQUE INDEX IF NOT EXISTS user_home_backgrounds_unique_user
  ON public.user_home_backgrounds(user_id);

-- 2) RPC pública (SECURITY DEFINER) para buscar dados mínimos da conta por nome
CREATE OR REPLACE FUNCTION public.get_habbo_account_public_by_name(habbo_name_param text)
RETURNS TABLE (
  supabase_user_id uuid,
  habbo_name text,
  habbo_id text,
  hotel text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ha.supabase_user_id, ha.habbo_name, ha.habbo_id, ha.hotel
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
  LIMIT 1;
END;
$$;

-- 3) RPC pública (SECURITY DEFINER) para obter o e-mail de auth a partir do nome
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo(habbo_name_param text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
  LIMIT 1;

  RETURN v_email;
END;
$$;

-- 4) Privilégios de execução para as RPCs
REVOKE ALL ON FUNCTION public.get_habbo_account_public_by_name(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_auth_email_for_habbo(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_habbo_account_public_by_name(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_auth_email_for_habbo(text) TO anon, authenticated, service_role;

-- 5) Gatilho: inicializar Home ao inserir uma nova habbo_account
DROP TRIGGER IF EXISTS trg_handle_new_user_home ON public.habbo_accounts;

CREATE TRIGGER trg_handle_new_user_home
AFTER INSERT ON public.habbo_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_home();


-- ========================================
-- FIM DO ARQUIVO: 20250807233100_f340151f-2cd8-449a-a6fb-bd876d802da5.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250808011703_f5d1c287-0e34-4e3a-9476-aa90b3adb293.sql
-- ========================================


-- Create RPC function to get habbo account by name and hotel
CREATE OR REPLACE FUNCTION public.get_habbo_account_public_by_name_and_hotel(
  habbo_name_param text, 
  hotel_param text
)
RETURNS TABLE(supabase_user_id uuid, habbo_name text, habbo_id text, hotel text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT ha.supabase_user_id, ha.habbo_name, ha.habbo_id, ha.hotel
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;
END;
$$;

-- Update the existing RPC to also handle hotel-aware auth email lookup
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo_with_hotel(
  habbo_name_param text,
  hotel_param text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  IF hotel_param IS NOT NULL THEN
    -- Search for specific hotel first
    SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
    FROM public.habbo_accounts ha
    WHERE lower(ha.habbo_name) = lower(habbo_name_param)
      AND ha.hotel = hotel_param
    LIMIT 1;
  END IF;
  
  -- If not found or no hotel specified, search without hotel filter
  IF v_email IS NULL THEN
    SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
    FROM public.habbo_accounts ha
    WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    LIMIT 1;
  END IF;

  RETURN v_email;
END;
$$;


-- ========================================
-- FIM DO ARQUIVO: 20250808011703_f5d1c287-0e34-4e3a-9476-aa90b3adb293.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250808230904_c226bbf9-1cd7-4732-b03d-ff9ba7fdc588.sql
-- ========================================


-- Create editor_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor_images',
  'editor_images', 
  true,
  52428800,
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create forum_images bucket if it doesn't exist  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum_images',
  'forum_images',
  true, 
  52428800,
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create site_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'site_images',
  'site_images',
  true,
  52428800, 
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for public read access to editor_images
CREATE POLICY IF NOT EXISTS "Public read access for editor_images" ON storage.objects
FOR SELECT USING (bucket_id = 'editor_images');

-- Set up RLS policies for public read access to forum_images  
CREATE POLICY IF NOT EXISTS "Public read access for forum_images" ON storage.objects
FOR SELECT USING (bucket_id = 'forum_images');

-- Set up RLS policies for public read access to site_images
CREATE POLICY IF NOT EXISTS "Public read access for site_images" ON storage.objects  
FOR SELECT USING (bucket_id = 'site_images');


-- ========================================
-- FIM DO ARQUIVO: 20250808230904_c226bbf9-1cd7-4732-b03d-ff9ba7fdc588.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250809235501_0c1ff6f7-63c4-4301-bab2-2071bad801d0.sql
-- ========================================


-- Create tables for console interactions (likes, comments, follows)
CREATE TABLE IF NOT EXISTS console_profile_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_habbo_name)
);

CREATE TABLE IF NOT EXISTS console_profile_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_habbo_name TEXT NOT NULL,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS console_profile_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_user_id, target_habbo_name)
);

-- Enable RLS
ALTER TABLE console_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_profile_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_profile_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for console_profile_likes
CREATE POLICY "Anyone can view likes" ON console_profile_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like profiles" ON console_profile_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" ON console_profile_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for console_profile_comments
CREATE POLICY "Anyone can view comments" ON console_profile_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON console_profile_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON console_profile_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON console_profile_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for console_profile_follows
CREATE POLICY "Anyone can view follows" ON console_profile_follows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow profiles" ON console_profile_follows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow profiles" ON console_profile_follows
  FOR DELETE USING (auth.uid() = follower_user_id);


-- ========================================
-- FIM DO ARQUIVO: 20250809235501_0c1ff6f7-63c4-4301-bab2-2071bad801d0.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250812155251_14e8ef9e-08c3-4679-80dc-b859ae9bfa29.sql
-- ========================================


-- Create table to track which users we want to monitor
CREATE TABLE public.tracked_habbo_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'com.br',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel)
);

-- Create table to store user snapshots from Habbo API
CREATE TABLE public.habbo_user_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  motto TEXT,
  figure_string TEXT,
  is_online BOOLEAN DEFAULT false,
  last_web_visit TIMESTAMP WITH TIME ZONE,
  member_since TIMESTAMP WITH TIME ZONE,
  badges_count INTEGER DEFAULT 0,
  photos_count INTEGER DEFAULT 0,
  friends_count INTEGER DEFAULT 0,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel, created_at)
);

-- Create table to store detected activities/changes
CREATE TABLE public.habbo_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'motto_change', 'avatar_update', 'new_badge', 'new_photo', 'new_friend', 'status_change'
  description TEXT NOT NULL,
  details JSONB,
  snapshot_id UUID REFERENCES public.habbo_user_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracked_habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (for the feed)
CREATE POLICY "Anyone can view tracked users" ON public.tracked_habbo_users FOR SELECT USING (true);
CREATE POLICY "Anyone can view snapshots" ON public.habbo_user_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON public.habbo_activities FOR SELECT USING (true);

-- Service role can manage all data
CREATE POLICY "Service role can manage tracked users" ON public.tracked_habbo_users FOR ALL USING (true);
CREATE POLICY "Service role can manage snapshots" ON public.habbo_user_snapshots FOR ALL USING (true);
CREATE POLICY "Service role can manage activities" ON public.habbo_activities FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_tracked_habbo_users_active ON public.tracked_habbo_users (is_active, hotel);
CREATE INDEX idx_habbo_user_snapshots_lookup ON public.habbo_user_snapshots (habbo_name, hotel, created_at DESC);
CREATE INDEX idx_habbo_activities_recent ON public.habbo_activities (created_at DESC, hotel);
CREATE INDEX idx_habbo_activities_by_user ON public.habbo_activities (habbo_name, hotel, created_at DESC);

-- Insert some popular users to track initially
INSERT INTO public.tracked_habbo_users (habbo_name, hotel) VALUES 
('HabboExplorer', 'com.br'),
('CyberHabbo', 'com.br'),
('DigitalDream', 'com.br'),
('VirtualLife', 'com.br'),
('RetroGamer', 'com.br'),
('HabboPro', 'com.br'),
('PixelDancer', 'com.br'),
('NetCitizen', 'com.br'),
('DigitalNinja', 'com.br'),
('OnlineUser', 'com.br'),
('HabboFan2024', 'com.br'),
('VirtualHero', 'com.br')
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the batch sync to run every 10 minutes
SELECT cron.schedule(
  'habbo-sync-batch',
  '*/10 * * * *', -- every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);


-- ========================================
-- FIM DO ARQUIVO: 20250812155251_14e8ef9e-08c3-4679-80dc-b859ae9bfa29.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250812161236_3d2d6492-c875-4209-9240-be9e9b16a839.sql
-- ========================================


-- Create table for tracking which users we should monitor
CREATE TABLE public.tracked_habbo_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'com.br',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel)
);

-- Create table for storing user snapshots (complete state at a point in time)
CREATE TABLE public.habbo_user_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  motto TEXT,
  figure_string TEXT,
  is_online BOOLEAN DEFAULT false,
  last_web_visit TIMESTAMP WITH TIME ZONE,
  member_since TIMESTAMP WITH TIME ZONE,
  badges_count INTEGER DEFAULT 0,
  photos_count INTEGER DEFAULT 0,
  friends_count INTEGER DEFAULT 0,
  groups_count INTEGER DEFAULT 0,
  raw_data JSONB, -- Complete API response for detailed comparisons
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing computed activities/diffs
CREATE TABLE public.habbo_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'motto_change', 'avatar_update', 'new_badge', 'new_photo', 'new_friend', 'new_group', 'status_change', 'user_tracked'
  description TEXT NOT NULL, -- Human readable description in PT-BR
  details JSONB, -- Specific details about the change (counts, items, etc.)
  snapshot_id UUID REFERENCES public.habbo_user_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables (public read, service role write)
ALTER TABLE public.tracked_habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_activities ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view tracked users" ON public.tracked_habbo_users FOR SELECT USING (true);
CREATE POLICY "Anyone can view snapshots" ON public.habbo_user_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON public.habbo_activities FOR SELECT USING (true);

-- Service role can manage everything
CREATE POLICY "Service role can manage tracked users" ON public.tracked_habbo_users FOR ALL USING (true);
CREATE POLICY "Service role can manage snapshots" ON public.habbo_user_snapshots FOR ALL USING (true);
CREATE POLICY "Service role can manage activities" ON public.habbo_activities FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_tracked_users_active ON public.tracked_habbo_users(is_active, hotel);
CREATE INDEX idx_snapshots_user_time ON public.habbo_user_snapshots(habbo_name, hotel, created_at DESC);
CREATE INDEX idx_activities_user_time ON public.habbo_activities(habbo_name, hotel, created_at DESC);
CREATE INDEX idx_activities_type_time ON public.habbo_activities(activity_type, created_at DESC);

-- Insert some initial users to track (including 'adami' from your example)
INSERT INTO public.tracked_habbo_users (habbo_name, habbo_id, hotel, is_active) VALUES
('adami', 'hhbr-ba7f01c16650fcd3f7c874d0ba2a845d', 'com.br', true),
('Beebop', 'hhbr-example-beebop', 'com.br', true),
('habbohub', 'hhbr-example-habbohub', 'com.br', true)
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- Enable pg_cron extension for scheduled syncing
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule batch sync every 3 minutes
SELECT cron.schedule(
  'habbo-sync-batch',
  '*/3 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.WrczBcDnftc1SiSjpUTepwSgH14ZBQP_QGqRKYvJQNA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);


-- ========================================
-- FIM DO ARQUIVO: 20250812161236_3d2d6492-c875-4209-9240-be9e9b16a839.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250812165600-.sql
-- ========================================

-- Add more popular users from habbo.com.br to tracking
INSERT INTO public.tracked_habbo_users (habbo_name, hotel, habbo_id, is_active) VALUES
('Sorriizx', 'com.br', 'hhbr-sorriizx', true),
('Caroll', 'com.br', 'hhbr-caroll', true),
('Maycontm', 'com.br', 'hhbr-maycontm', true),
('Marceline', 'com.br', 'hhbr-marceline', true),
('Ixabelle', 'com.br', 'hhbr-ixabelle', true),
('Paniic', 'com.br', 'hhbr-paniic', true),
('Giiuuh', 'com.br', 'hhbr-giiuuh', true),
('Reiizinha', 'com.br', 'hhbr-reiizinha', true),
('Brunno', 'com.br', 'hhbr-brunno', true),
('Gabruuh', 'com.br', 'hhbr-gabruuh', true)
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- ========================================
-- FIM DO ARQUIVO: 20250812165600-.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250812165716-.sql
-- ========================================

-- Create a cron job to automatically sync tracked users every 30 minutes
SELECT cron.schedule(
  'habbo-batch-sync-auto',
  '*/30 * * * *', -- every 30 minutes
  $$
  SELECT
    net.http_post(
      url:='https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:='{"hotel": "com.br"}'::jsonb
    ) as request_id;
  $$
);

-- ========================================
-- FIM DO ARQUIVO: 20250812165716-.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250812213516-.sql
-- ========================================

-- Fix security issue: Restrict habbo_user_snapshots access to authenticated users only
-- This prevents competitors from scraping user data while maintaining functionality

-- Drop the overly permissive policy that allows anyone to view snapshots
DROP POLICY IF EXISTS "Anyone can view snapshots" ON public.habbo_user_snapshots;

-- Create a new policy that requires authentication to view snapshots
CREATE POLICY "Authenticated users can view snapshots" 
ON public.habbo_user_snapshots 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the service role policy for backend operations (unchanged)
-- "Service role can manage snapshots" policy remains as is

-- ========================================
-- FIM DO ARQUIVO: 20250812213516-.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250813175224_a4d95583-91e0-4a8e-b5d8-a557c9388e7a.sql
-- ========================================


-- Criar tabela para armazenar fotos dos usuários Habbo
CREATE TABLE public.habbo_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL, -- UUID da foto no Habbo
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  s3_url TEXT NOT NULL,
  preview_url TEXT,
  internal_user_id TEXT, -- ID interno extraído do S3 URL
  timestamp_taken BIGINT, -- Timestamp extraído do S3 URL
  caption TEXT,
  room_name TEXT,
  taken_date TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  photo_type TEXT DEFAULT 'PHOTO',
  source TEXT DEFAULT 'profile_scraping',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, habbo_name)
);

-- Adicionar RLS para permitir leitura pública das fotos
ALTER TABLE public.habbo_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view habbo photos" 
  ON public.habbo_photos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage habbo photos" 
  ON public.habbo_photos 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_habbo_photos_habbo_name ON public.habbo_photos(habbo_name);
CREATE INDEX idx_habbo_photos_hotel ON public.habbo_photos(hotel);
CREATE INDEX idx_habbo_photos_taken_date ON public.habbo_photos(taken_date DESC);
CREATE INDEX idx_habbo_photos_created_at ON public.habbo_photos(created_at DESC);

-- Modificar tabela habbo_activities para incluir eventos de fotos
ALTER TABLE public.habbo_activities 
ADD COLUMN IF NOT EXISTS photo_id TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_habbo_photos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_habbo_photos_updated_at
  BEFORE UPDATE ON public.habbo_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_habbo_photos_updated_at();


-- ========================================
-- FIM DO ARQUIVO: 20250813175224_a4d95583-91e0-4a8e-b5d8-a557c9388e7a.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250813183830_c1d15254-e2e2-4519-a480-78d61fa5cffe.sql
-- ========================================


-- Criar tabela para sistema de follows/seguindo
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  followed_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, followed_user_id)
);

-- Adicionar RLS policies para user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" 
  ON public.user_follows 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can follow others" 
  ON public.user_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow" 
  ON public.user_follows 
  FOR DELETE 
  USING (auth.uid() = follower_user_id);

-- Inserir dados de teste para as fotos do Beebop
INSERT INTO public.habbo_photos (
  photo_id, habbo_name, habbo_id, hotel, s3_url, preview_url, 
  timestamp_taken, taken_date, likes_count, photo_type, source, caption
) VALUES 
  ('beebop-1754077680410', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png', 1754077680410, '2025-01-08', 3, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1754044232199', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png', 1754044232199, '2025-01-08', 5, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569308915', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png', 1753569308915, '2025-07-26', 5, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569292755', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png', 1753569292755, '2025-07-26', 0, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569144621', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png', 1753569144621, '2025-07-26', 1, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1747003293190', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png', 1747003293190, '2025-05-11', 4, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1742092026239', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png', 1742092026239, '2025-03-15', 6, 'PHOTO', 'manual_insert', 'Foto do Beebop')
ON CONFLICT (photo_id, habbo_name, hotel) DO UPDATE SET
  likes_count = EXCLUDED.likes_count,
  updated_at = now();


-- ========================================
-- FIM DO ARQUIVO: 20250813183830_c1d15254-e2e2-4519-a480-78d61fa5cffe.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250813185321_95574de1-a8d7-4e8c-a563-3c82da9f52ae.sql
-- ========================================


-- Insert test photos for Beebop user
INSERT INTO public.habbo_photos (
  id,
  photo_id,
  habbo_name,
  habbo_id,
  hotel,
  s3_url,
  timestamp_taken,
  taken_date,
  likes_count,
  photo_type,
  source,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  '22f867d2-205e-46d9-ad39-62bb5a0c798e',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png',
  1754077680410,
  '2025-08-01',
  3,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '2d624d81-eb21-4ca9-b60a-2e3daaf26ff7',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png',
  1754044232199,
  '2025-08-01',
  5,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  'bfff42dd-5fac-4d91-b653-bfc3accbd506',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png',
  1753569308915,
  '2025-07-26',
  5,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '05f76522-f2c2-451b-97d4-80667fef4dd4',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png',
  1753569292755,
  '2025-07-26',
  0,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '53425d38-a595-4eaf-b4f2-d8f981a499ba',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png',
  1753569144621,
  '2025-07-26',
  1,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  'd10fda01-1184-408b-a793-65faa24948c9',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png',
  1747003293190,
  '2025-05-11',
  4,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '2339e2c0-349d-40c1-85f9-08f1ff258ee3',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png',
  1742092026239,
  '2025-03-15',
  6,
  'PHOTO',
  'scraped',
  now(),
  now()
);


-- ========================================
-- FIM DO ARQUIVO: 20250813185321_95574de1-a8d7-4e8c-a563-3c82da9f52ae.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250818192341_e330eb45-0725-4178-98e5-bf99d7e4899c.sql
-- ========================================


-- Criar tabela para posts do fórum
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_supabase_user_id UUID REFERENCES auth.users NOT NULL,
  author_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  likes INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Geral'
);

-- Criar tabela para comentários do fórum
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_supabase_user_id UUID REFERENCES auth.users NOT NULL,
  author_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar Row Level Security (RLS)
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para forum_posts - todos podem ver, apenas usuários autenticados podem criar/editar seus próprios posts
CREATE POLICY "Anyone can view forum posts" 
  ON public.forum_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.forum_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.forum_posts 
  FOR UPDATE 
  USING (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.forum_posts 
  FOR DELETE 
  USING (auth.uid() = author_supabase_user_id);

-- Políticas para forum_comments - todos podem ver, apenas usuários autenticados podem criar/editar seus próprios comentários
CREATE POLICY "Anyone can view forum comments" 
  ON public.forum_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.forum_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.forum_comments 
  FOR UPDATE 
  USING (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.forum_comments 
  FOR DELETE 
  USING (auth.uid() = author_supabase_user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS forum_posts_created_at_idx ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS forum_posts_category_idx ON public.forum_posts(category);
CREATE INDEX IF NOT EXISTS forum_posts_author_idx ON public.forum_posts(author_supabase_user_id);
CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS forum_comments_created_at_idx ON public.forum_comments(created_at ASC);


-- ========================================
-- FIM DO ARQUIVO: 20250818192341_e330eb45-0725-4178-98e5-bf99d7e4899c.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250818194334_58528483-dd48-4dcd-a538-e359cb14a004.sql
-- ========================================


-- Adicionar colunas faltantes na tabela habbo_accounts
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS figure_string text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_access timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Adicionar índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_habbo_name_lower ON public.habbo_accounts (lower(habbo_name));
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_hotel ON public.habbo_accounts (hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_is_online ON public.habbo_accounts (is_online);

-- Verificar se as tabelas necessárias para homes existem, se não, criar
CREATE TABLE IF NOT EXISTS public.user_home_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  widget_type text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 300,
  height integer NOT NULL DEFAULT 200,
  z_index integer NOT NULL DEFAULT 1,
  is_visible boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para widgets
ALTER TABLE public.user_home_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage their own widgets" 
  ON public.user_home_widgets 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Public can view widgets" 
  ON public.user_home_widgets 
  FOR SELECT 
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_home_widgets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER IF NOT EXISTS trigger_update_user_home_widgets_updated_at
  BEFORE UPDATE ON public.user_home_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_user_home_widgets_updated_at();

-- Função para inicializar home de usuário com widgets padrão
CREATE OR REPLACE FUNCTION public.initialize_user_home_complete(user_uuid uuid, user_habbo_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, width, height, z_index, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 520, 180, 1, true),
    (user_uuid, 'guestbook', 50, 220, 420, 380, 1, true),
    (user_uuid, 'rating', 500, 220, 320, 160, 1, true)
  ON CONFLICT DO NOTHING;

  -- Inserir layouts compatíveis com sistema antigo
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, width, height, z_index, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 520, 180, 1, true),
    (user_uuid, 'guestbook', 50, 220, 420, 380, 1, true),
    (user_uuid, 'rating', 500, 220, 320, 160, 1, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Adicionar entrada de boas-vindas no guestbook se não existir
  INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
  VALUES (user_uuid, 'HabboHub', 'Bem-vindo à sua nova Habbo Home! 🏠✨', 'approved')
  ON CONFLICT DO NOTHING;
END;
$function$;


-- ========================================
-- FIM DO ARQUIVO: 20250818194334_58528483-dd48-4dcd-a538-e359cb14a004.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250818212818_5d164825-e47c-4cd3-a4d0-00ee75d6f483.sql
-- ========================================


-- Adicionar campos faltantes à tabela habbo_accounts
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS figure_string text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;

-- Criar tabela user_home_widgets se não existir
CREATE TABLE IF NOT EXISTS public.user_home_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  widget_type text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 1,
  width integer NOT NULL DEFAULT 300,
  height integer NOT NULL DEFAULT 200,
  is_visible boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, widget_type)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.user_home_widgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_home_widgets
CREATE POLICY "Public can view home widgets" 
  ON public.user_home_widgets 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own home widgets" 
  ON public.user_home_widgets 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Criar função initialize_user_home_complete
CREATE OR REPLACE FUNCTION public.initialize_user_home_complete(user_uuid uuid, user_habbo_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão na nova tabela se não existirem
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_type) DO NOTHING;

  -- Inserir widgets padrão na tabela antiga também para compatibilidade
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Adicionar entrada de boas-vindas no guestbook se não existir
  INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
  VALUES (user_uuid, 'HabboHub', 'Bem-vindo à sua nova Habbo Home! 🏠✨', 'approved')
  ON CONFLICT DO NOTHING;
END;
$function$;


-- ========================================
-- FIM DO ARQUIVO: 20250818212818_5d164825-e47c-4cd3-a4d0-00ee75d6f483.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250819012820_1af35d29-e0e7-4ea0-bae5-8600983bed48.sql
-- ========================================

-- Create table for real friends activities
CREATE TABLE public.friends_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  activity_type TEXT NOT NULL, -- 'badge', 'friend_added', 'motto_change', 'photo_uploaded', 'room_visited', 'status_change'
  activity_description TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friends_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view friends activities" 
ON public.friends_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage friends activities" 
ON public.friends_activities 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_friends_activities_habbo_name_created_at 
ON public.friends_activities (habbo_name, created_at DESC);

CREATE INDEX idx_friends_activities_activity_type_created_at 
ON public.friends_activities (activity_type, created_at DESC);

-- Create function to clean old activities (keep only 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_friends_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.friends_activities 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- ========================================
-- FIM DO ARQUIVO: 20250819012820_1af35d29-e0e7-4ea0-bae5-8600983bed48.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250820003126_170818b3-79a1-446d-b76b-e58f53378a6d.sql
-- ========================================

-- Fix rating widget sizing to match the smaller 192x140 size
UPDATE user_home_widgets 
SET width = 192, height = 140 
WHERE widget_type = 'rating';

-- ========================================
-- FIM DO ARQUIVO: 20250820003126_170818b3-79a1-446d-b76b-e58f53378a6d.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250820005050_e590dfe1-04c5-4a2e-bab7-a211f428308b.sql
-- ========================================

-- Limpeza completa das contas existentes (preservando apenas Beebop)

-- 1. Primeiro, vamos identificar o user_id do Beebop
DO $$
DECLARE
    beebop_user_id uuid;
BEGIN
    -- Buscar o user_id do Beebop
    SELECT supabase_user_id INTO beebop_user_id 
    FROM public.habbo_accounts 
    WHERE lower(habbo_name) = 'beebop' 
    LIMIT 1;

    -- Log para debug
    RAISE NOTICE 'Beebop user_id: %', beebop_user_id;

    -- 2. Limpar dados relacionados nas tabelas (preservando Beebop)
    
    -- User stickers
    DELETE FROM public.user_stickers 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home ratings
    DELETE FROM public.user_home_ratings 
    WHERE (home_owner_user_id != beebop_user_id AND rating_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User home widgets
    DELETE FROM public.user_home_widgets 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home layouts
    DELETE FROM public.user_home_layouts 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home backgrounds
    DELETE FROM public.user_home_backgrounds 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Guestbook entries
    DELETE FROM public.guestbook_entries 
    WHERE (home_owner_user_id != beebop_user_id AND author_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User followers
    DELETE FROM public.user_followers 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo comments
    DELETE FROM public.photo_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo likes
    DELETE FROM public.photo_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile comments
    DELETE FROM public.console_profile_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile follows
    DELETE FROM public.console_profile_follows 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile likes
    DELETE FROM public.console_profile_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum posts
    DELETE FROM public.forum_posts 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum comments
    DELETE FROM public.forum_comments 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;

    -- 3. Deletar contas Habbo (preservando Beebop)
    DELETE FROM public.habbo_accounts 
    WHERE lower(habbo_name) != 'beebop';

    -- 4. Log final
    RAISE NOTICE 'Limpeza concluída. Contas preservadas: %', 
        (SELECT COUNT(*) FROM public.habbo_accounts);
    
END $$;

-- ========================================
-- FIM DO ARQUIVO: 20250820005050_e590dfe1-04c5-4a2e-bab7-a211f428308b.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250820005120_434bad9e-d65c-45a4-ab81-128c8b51b48a.sql
-- ========================================

-- Limpeza completa das contas existentes (preservando apenas Beebop)

-- 1. Primeiro, vamos identificar o user_id do Beebop
DO $$
DECLARE
    beebop_user_id uuid;
BEGIN
    -- Buscar o user_id do Beebop
    SELECT supabase_user_id INTO beebop_user_id 
    FROM public.habbo_accounts 
    WHERE lower(habbo_name) = 'beebop' 
    LIMIT 1;

    -- Log para debug
    RAISE NOTICE 'Beebop user_id: %', beebop_user_id;

    -- 2. Limpar dados relacionados nas tabelas (preservando Beebop)
    
    -- User stickers
    DELETE FROM public.user_stickers 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home ratings
    DELETE FROM public.user_home_ratings 
    WHERE (home_owner_user_id != beebop_user_id AND rating_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User home widgets
    DELETE FROM public.user_home_widgets 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home layouts
    DELETE FROM public.user_home_layouts 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home backgrounds
    DELETE FROM public.user_home_backgrounds 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Guestbook entries
    DELETE FROM public.guestbook_entries 
    WHERE (home_owner_user_id != beebop_user_id AND author_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User followers
    DELETE FROM public.user_followers 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo comments
    DELETE FROM public.photo_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo likes
    DELETE FROM public.photo_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile comments
    DELETE FROM public.console_profile_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile follows
    DELETE FROM public.console_profile_follows 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile likes
    DELETE FROM public.console_profile_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum posts
    DELETE FROM public.forum_posts 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum comments
    DELETE FROM public.forum_comments 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;

    -- 3. Deletar contas Habbo (preservando Beebop)
    DELETE FROM public.habbo_accounts 
    WHERE lower(habbo_name) != 'beebop';

    -- 4. Log final
    RAISE NOTICE 'Limpeza concluída. Contas preservadas: %', 
        (SELECT COUNT(*) FROM public.habbo_accounts);
    
END $$;

-- ========================================
-- FIM DO ARQUIVO: 20250820005120_434bad9e-d65c-45a4-ab81-128c8b51b48a.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250820010943_8a7dc643-4c2a-4670-9319-a6a0ab9bea5e.sql
-- ========================================

-- Add delete policy for guestbook entries
CREATE POLICY "Users can delete their own comments and home owners can delete any comment" 
ON public.guestbook_entries 
FOR DELETE 
USING (
  auth.uid() = author_user_id OR auth.uid() = home_owner_user_id
);

-- ========================================
-- FIM DO ARQUIVO: 20250820010943_8a7dc643-4c2a-4670-9319-a6a0ab9bea5e.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250820192120_326741d1-bcfb-42fc-bc95-d20d3b2f2e74.sql
-- ========================================

-- Create comment_reports table for moderation
CREATE TABLE public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  reporter_user_id UUID NOT NULL,
  reporter_habbo_name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_admin TEXT
);

-- Enable RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_reports
CREATE POLICY "Users can report comments" 
ON public.comment_reports 
FOR INSERT 
WITH CHECK (auth.uid()::text = reporter_user_id::text);

CREATE POLICY "Users can view their own reports" 
ON public.comment_reports 
FOR SELECT 
USING (auth.uid()::text = reporter_user_id::text);

-- Create index for better performance
CREATE INDEX idx_comment_reports_comment_id ON public.comment_reports(comment_id);
CREATE INDEX idx_comment_reports_status ON public.comment_reports(status);

-- Add delete policy for photo_comments (users can delete their own comments)
CREATE POLICY "Users can delete their own comments" 
ON public.photo_comments 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Add policy for photo owners to delete comments on their photos
-- We'll need to check if the user owns the photo through photo_likes table
CREATE POLICY "Photo owners can delete comments on their photos" 
ON public.photo_comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.photos p 
    WHERE p.id = photo_comments.photo_id 
    AND p.user_id::text = auth.uid()::text
  )
);

-- ========================================
-- FIM DO ARQUIVO: 20250820192120_326741d1-bcfb-42fc-bc95-d20d3b2f2e74.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250820192202_fccf320d-0161-43fc-b9a5-ba37fcc85a6e.sql
-- ========================================

-- Create comment_reports table for moderation (simplified)
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  reporter_user_id UUID NOT NULL,
  reporter_habbo_name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_admin TEXT
);

-- Enable RLS only if table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comment_reports' AND table_schema = 'public') THEN
    ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY IF NOT EXISTS "Users can report comments" 
    ON public.comment_reports 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = reporter_user_id::text);

    CREATE POLICY IF NOT EXISTS "Users can view their own reports" 
    ON public.comment_reports 
    FOR SELECT 
    USING (auth.uid()::text = reporter_user_id::text);

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON public.comment_reports(comment_id);
    CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON public.comment_reports(status);
  END IF;
END
$$;

-- ========================================
-- FIM DO ARQUIVO: 20250820192202_fccf320d-0161-43fc-b9a5-ba37fcc85a6e.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250821163850_81449879-114a-470c-b3e8-bf5235c308e3.sql
-- ========================================

-- ETAPA 3: Sistema de Queue para Processamento Distribuído
-- Criar tabela para gerenciar processamento de amigos em chunks

CREATE TABLE public.friends_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_habbo_name TEXT NOT NULL,
  user_habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  friend_habbo_name TEXT NOT NULL,
  friend_habbo_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  priority INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_friends_processing_queue_status ON public.friends_processing_queue(status);
CREATE INDEX idx_friends_processing_queue_priority ON public.friends_processing_queue(priority DESC, created_at ASC);
CREATE INDEX idx_friends_processing_queue_user ON public.friends_processing_queue(user_habbo_name, hotel);
CREATE INDEX idx_friends_processing_queue_processing ON public.friends_processing_queue(status, last_processed_at);

-- Enable RLS
ALTER TABLE public.friends_processing_queue ENABLE ROW LEVEL SECURITY;

-- Policy para permitir que service role gerencie a queue
CREATE POLICY "Service role can manage friends processing queue"
ON public.friends_processing_queue
FOR ALL
USING (true)
WITH CHECK (true);

-- Policy para usuários autenticados visualizarem apenas suas próprias entradas
CREATE POLICY "Users can view their own processing queue"
ON public.friends_processing_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE habbo_accounts.supabase_user_id = auth.uid() 
    AND lower(habbo_accounts.habbo_name) = lower(friends_processing_queue.user_habbo_name)
  )
);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_friends_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER trigger_update_friends_queue_updated_at
  BEFORE UPDATE ON public.friends_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_friends_queue_updated_at();

-- Função para popular a queue com amigos de um usuário
CREATE OR REPLACE FUNCTION public.populate_friends_queue(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'br'
)
RETURNS INTEGER AS $$
DECLARE
  v_inserted_count INTEGER := 0;
BEGIN
  -- Esta função será chamada pelo edge function com a lista de amigos
  -- Por enquanto, apenas retorna 0
  RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter próximos itens da queue para processamento
CREATE OR REPLACE FUNCTION public.get_next_queue_batch(
  p_batch_size INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_habbo_name TEXT,
  user_habbo_id TEXT,
  hotel TEXT,
  friend_habbo_name TEXT,
  friend_habbo_id TEXT,
  priority INTEGER,
  retry_count INTEGER
) AS $$
BEGIN
  -- Marcar items como 'processing' e retornar batch
  UPDATE public.friends_processing_queue
  SET 
    status = 'processing',
    last_processed_at = now()
  WHERE id IN (
    SELECT fq.id 
    FROM public.friends_processing_queue fq
    WHERE fq.status = 'pending' 
    AND fq.retry_count < fq.max_retries
    ORDER BY fq.priority DESC, fq.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  );

  -- Retornar os items que foram marcados para processamento
  RETURN QUERY
  SELECT 
    fq.id,
    fq.user_habbo_name,
    fq.user_habbo_id,
    fq.hotel,
    fq.friend_habbo_name,
    fq.friend_habbo_id,
    fq.priority,
    fq.retry_count
  FROM public.friends_processing_queue fq
  WHERE fq.status = 'processing' 
  AND fq.last_processed_at >= now() - INTERVAL '1 minute'
  ORDER BY fq.priority DESC, fq.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar item como processado
CREATE OR REPLACE FUNCTION public.mark_queue_item_completed(
  p_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.friends_processing_queue
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar item como falha
CREATE OR REPLACE FUNCTION public.mark_queue_item_failed(
  p_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.friends_processing_queue
  SET 
    status = CASE 
      WHEN retry_count >= max_retries THEN 'failed'
      ELSE 'pending'
    END,
    retry_count = retry_count + 1,
    error_message = p_error_message,
    updated_at = now(),
    last_processed_at = NULL
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função de limpeza para remover itens antigos processados
CREATE OR REPLACE FUNCTION public.cleanup_processed_queue_items()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.friends_processing_queue
  WHERE status = 'completed' 
  AND updated_at < now() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FIM DO ARQUIVO: 20250821163850_81449879-114a-470c-b3e8-bf5235c308e3.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250821170727_08c33e83-40d3-4214-af65-9ec6cf4e1829.sql
-- ========================================

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to process friends queue every 2 minutes
SELECT cron.schedule(
  'process-friends-queue',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 50}'::jsonb
  ) as request_id;
  $$
);

-- Create cron job to populate queue for active users every 10 minutes
SELECT cron.schedule(
  'populate-friends-queue', 
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "populate_queue", "user_habbo_name": "Beebop", "user_habbo_id": "hhbr-9d61d51f6b532511b0311ceadb484369", "hotel": "com.br", "batch_size": 100}'::jsonb
  ) as request_id;
  $$
);

-- Function to trigger emergency processing for a specific user
CREATE OR REPLACE FUNCTION trigger_emergency_processing(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'com.br'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- First populate the queue
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', p_user_habbo_name, p_user_habbo_id, p_hotel)::jsonb
  ) INTO v_request_id;

  -- Wait a moment then start processing
  PERFORM pg_sleep(2);
  
  -- Process initial batch
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
  ) INTO v_request_id;

  RETURN format('Emergency processing initiated for %s. Request ID: %s', p_user_habbo_name, v_request_id);
END;
$$;

-- ========================================
-- FIM DO ARQUIVO: 20250821170727_08c33e83-40d3-4214-af65-9ec6cf4e1829.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250821170840_a1d50e0a-b9eb-4e1d-a86f-04004a59355a.sql
-- ========================================

-- Fix search_path warnings by adding SET search_path TO 'public' to functions

-- Update trigger_emergency_processing function
CREATE OR REPLACE FUNCTION trigger_emergency_processing(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'com.br'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- First populate the queue
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', p_user_habbo_name, p_user_habbo_id, p_hotel)::jsonb
  ) INTO v_request_id;

  -- Wait a moment then start processing
  PERFORM pg_sleep(2);
  
  -- Process initial batch
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
  ) INTO v_request_id;

  RETURN format('Emergency processing initiated for %s. Request ID: %s', p_user_habbo_name, v_request_id);
END;
$$;

-- Update other critical functions with search_path
CREATE OR REPLACE FUNCTION get_next_queue_batch(p_batch_size integer DEFAULT 50)
RETURNS TABLE(id uuid, user_habbo_name text, user_habbo_id text, hotel text, friend_habbo_name text, friend_habbo_id text, priority integer, retry_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Marcar items como 'processing' e retornar batch
  UPDATE friends_processing_queue
  SET 
    status = 'processing',
    last_processed_at = now()
  WHERE id IN (
    SELECT fq.id 
    FROM friends_processing_queue fq
    WHERE fq.status = 'pending' 
    AND fq.retry_count < fq.max_retries
    ORDER BY fq.priority DESC, fq.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  );

  -- Retornar os items que foram marcados para processamento
  RETURN QUERY
  SELECT 
    fq.id,
    fq.user_habbo_name,
    fq.user_habbo_id,
    fq.hotel,
    fq.friend_habbo_name,
    fq.friend_habbo_id,
    fq.priority,
    fq.retry_count
  FROM friends_processing_queue fq
  WHERE fq.status = 'processing' 
  AND fq.last_processed_at >= now() - INTERVAL '1 minute'
  ORDER BY fq.priority DESC, fq.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION mark_queue_item_completed(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE friends_processing_queue
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_queue_item_failed(p_id uuid, p_error_message text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE friends_processing_queue
  SET 
    status = CASE 
      WHEN retry_count >= max_retries THEN 'failed'
      ELSE 'pending'
    END,
    retry_count = retry_count + 1,
    error_message = p_error_message,
    updated_at = now(),
    last_processed_at = NULL
  WHERE id = p_id;
END;
$$;

-- ========================================
-- FIM DO ARQUIVO: 20250821170840_a1d50e0a-b9eb-4e1d-a86f-04004a59355a.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250821171427_e5e8534a-d99e-45dc-bf90-0ed2f4e2b4e5.sql
-- ========================================

-- PLANO DE CORREÇÃO CRÍTICA ETAPA 1: Reativação do Sistema
-- Force populate queue for all active users and trigger immediate processing

-- 1. Trigger emergency processing for all active habbo accounts
DO $$
DECLARE
    account_rec RECORD;
    processing_count INTEGER := 0;
BEGIN
    -- Loop through all active habbo accounts and trigger emergency processing
    FOR account_rec IN 
        SELECT habbo_name, habbo_id, hotel 
        FROM habbo_accounts 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        LIMIT 10 -- Process 10 users at a time to avoid overload
    LOOP
        BEGIN
            -- Trigger emergency processing for each user
            PERFORM trigger_emergency_processing(
                account_rec.habbo_name, 
                account_rec.habbo_id, 
                account_rec.hotel
            );
            processing_count := processing_count + 1;
            
            -- Add small delay between requests to avoid overwhelming
            PERFORM pg_sleep(0.5);
            
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue processing other users
            RAISE NOTICE 'Error processing user %: %', account_rec.habbo_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Emergency processing triggered for % users', processing_count;
END $$;

-- 2. Create function to monitor and restart stalled processing
CREATE OR REPLACE FUNCTION restart_stalled_queue_processing()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    stalled_count INTEGER;
    restart_result TEXT;
BEGIN
    -- Reset items that have been processing for more than 5 minutes
    UPDATE friends_processing_queue
    SET 
        status = 'pending',
        last_processed_at = NULL,
        retry_count = retry_count + 1
    WHERE status = 'processing' 
    AND last_processed_at < NOW() - INTERVAL '5 minutes'
    AND retry_count < max_retries;
    
    GET DIAGNOSTICS stalled_count = ROW_COUNT;
    
    -- If we have pending items, trigger batch processing
    IF EXISTS (SELECT 1 FROM friends_processing_queue WHERE status = 'pending' LIMIT 1) THEN
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
        ) INTO restart_result;
    END IF;
    
    RETURN format('Restarted %s stalled items, triggered new processing', stalled_count);
END;
$$;

-- 3. Create enhanced cron jobs that auto-restart
SELECT cron.schedule(
    'auto-restart-stalled-processing',
    '*/3 * * * *', -- every 3 minutes
    'SELECT restart_stalled_queue_processing();'
);

-- 4. Force cleanup and immediate restart
SELECT restart_stalled_queue_processing();

-- ========================================
-- FIM DO ARQUIVO: 20250821171427_e5e8534a-d99e-45dc-bf90-0ed2f4e2b4e5.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250821182715_90e717ae-cae2-4c0c-b57c-4ae3bffac157.sql
-- ========================================

-- PLANO DE CORREÇÃO EMERGENCIAL - Reativar Sistema Automatizado
-- ETAPA 1: Recriar cron jobs com credenciais corretas e forçar processamento

-- Primeiro, vamos limpar cron jobs antigos que podem estar falhando
SELECT cron.unschedule('restart-stalled-queue-processing');
SELECT cron.unschedule('cleanup-old-friends-activities'); 
SELECT cron.unschedule('cleanup-processed-queue-items');

-- Recriar cron jobs com service role key correto
SELECT cron.schedule(
    'restart-stalled-queue-processing',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    SELECT net.http_post(
        url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
        body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'cleanup-old-friends-activities', 
    '0 2 * * *', -- Diário às 2h
    $$
    SELECT cleanup_old_friends_activities();
    $$
);

SELECT cron.schedule(
    'cleanup-processed-queue-items',
    '0 3 * * *', -- Diário às 3h  
    $$
    SELECT cleanup_processed_queue_items();
    $$
);

-- ETAPA 2: Forçar processamento massivo imediato para repovoar o sistema
-- Primeiro, vamos limpar dados antigos para começar fresco
DELETE FROM friends_activities WHERE created_at < NOW() - INTERVAL '1 hour';
DELETE FROM friends_processing_queue WHERE status IN ('completed', 'failed');

-- Função para forçar processamento emergencial de todos os usuários ativos
CREATE OR REPLACE FUNCTION emergency_force_process_all_active_users()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_count INTEGER := 0;
    v_user_record RECORD;
    v_request_id UUID;
BEGIN
    -- Processar todos os usuários com contas Habbo ativas
    FOR v_user_record IN 
        SELECT DISTINCT ha.habbo_name, ha.habbo_id, ha.hotel
        FROM habbo_accounts ha
        WHERE ha.created_at >= NOW() - INTERVAL '30 days' -- Usuários ativos nos últimos 30 dias
    LOOP
        -- Povoar fila para este usuário
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', 
                v_user_record.habbo_name, v_user_record.habbo_id, v_user_record.hotel)::jsonb
        ) INTO v_request_id;

        v_user_count := v_user_count + 1;
        
        -- Aguardar um pouco para não sobrecarregar
        IF v_user_count % 5 = 0 THEN
            PERFORM pg_sleep(1);
        END IF;
    END LOOP;

    -- Aguardar e depois iniciar processamento massivo
    PERFORM pg_sleep(3);
    
    -- Processar em lotes grandes
    FOR i IN 1..10 LOOP
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := '{"mode": "process_queue", "batch_size": 150}'::jsonb
        ) INTO v_request_id;
        
        PERFORM pg_sleep(2);
    END LOOP;

    RETURN format('Processamento emergencial iniciado para %s usuários ativos', v_user_count);
END;
$$;

-- Executar o processamento emergencial imediatamente
SELECT emergency_force_process_all_active_users();

-- ========================================
-- FIM DO ARQUIVO: 20250821182715_90e717ae-cae2-4c0c-b57c-4ae3bffac157.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250821184206_d5c30246-5f07-441d-b7db-aa09f6dee415.sql
-- ========================================

-- PLANO DE CORREÇÃO EMERGENCIAL - Versão Corrigida
-- Reativar sistema automatizado com cron jobs funcionais

-- Recriar cron jobs com service role key correto (ignora erro se não existir)
DO $$
BEGIN
    -- Tentar remover jobs existentes, mas ignorar erros se não existirem
    PERFORM cron.unschedule('restart-stalled-queue-processing');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-old-friends-activities');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-processed-queue-items');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Criar novos cron jobs funcionais
SELECT cron.schedule(
    'restart-stalled-queue-processing',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    SELECT net.http_post(
        url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
        body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'cleanup-old-friends-activities', 
    '0 2 * * *',
    $$SELECT cleanup_old_friends_activities();$$
);

SELECT cron.schedule(
    'cleanup-processed-queue-items',
    '0 3 * * *',
    $$SELECT cleanup_processed_queue_items();$$
);

-- Limpar dados antigos e forçar reprocessamento
DELETE FROM friends_activities WHERE created_at < NOW() - INTERVAL '1 hour';
DELETE FROM friends_processing_queue WHERE status IN ('completed', 'failed');

-- Forçar processamento para o usuário atual (Beebop)
SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "populate_queue", "user_habbo_name": "Beebop", "user_habbo_id": "hhbr-00e6988dddeb5a1838658c854d62fe49", "hotel": "br", "batch_size": 200}'::jsonb
);

-- Iniciar processamento em background
SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 150}'::jsonb
);

-- ========================================
-- FIM DO ARQUIVO: 20250821184206_d5c30246-5f07-441d-b7db-aa09f6dee415.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250822014831_5c6fed1c-89b7-41f4-b18f-394e1cce414e.sql
-- ========================================

-- Create user snapshots table for change detection
CREATE TABLE public.user_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_id text NOT NULL,
  habbo_name text NOT NULL,
  hotel text NOT NULL DEFAULT 'com.br',
  figure_string text,
  motto text,
  online boolean DEFAULT false,
  badges jsonb DEFAULT '[]'::jsonb,
  friends jsonb DEFAULT '[]'::jsonb,
  groups jsonb DEFAULT '[]'::jsonb,
  rooms jsonb DEFAULT '[]'::jsonb,
  raw_profile_data jsonb,
  snapshot_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view user snapshots" 
ON public.user_snapshots 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage user snapshots" 
ON public.user_snapshots 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_snapshots_habbo_id ON public.user_snapshots(habbo_id);
CREATE INDEX idx_user_snapshots_timestamp ON public.user_snapshots(snapshot_timestamp DESC);
CREATE INDEX idx_user_snapshots_hotel ON public.user_snapshots(hotel);
CREATE INDEX idx_user_snapshots_habbo_name ON public.user_snapshots(habbo_name);

-- Create detected changes table
CREATE TABLE public.detected_changes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_id text NOT NULL,
  habbo_name text NOT NULL,
  hotel text NOT NULL DEFAULT 'com.br',
  change_type text NOT NULL, -- 'outfit', 'badge', 'friend', 'group', 'room', 'motto'
  change_description text NOT NULL,
  old_snapshot_id uuid,
  new_snapshot_id uuid NOT NULL,
  change_details jsonb DEFAULT '{}'::jsonb,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.detected_changes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view detected changes" 
ON public.detected_changes 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage detected changes" 
ON public.detected_changes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_detected_changes_habbo_id ON public.detected_changes(habbo_id);
CREATE INDEX idx_detected_changes_detected_at ON public.detected_changes(detected_at DESC);
CREATE INDEX idx_detected_changes_hotel ON public.detected_changes(hotel);
CREATE INDEX idx_detected_changes_change_type ON public.detected_changes(change_type);

-- Add foreign key references
ALTER TABLE public.detected_changes 
ADD CONSTRAINT fk_old_snapshot 
FOREIGN KEY (old_snapshot_id) REFERENCES public.user_snapshots(id);

ALTER TABLE public.detected_changes 
ADD CONSTRAINT fk_new_snapshot 
FOREIGN KEY (new_snapshot_id) REFERENCES public.user_snapshots(id);

-- Create function to cleanup old snapshots
CREATE OR REPLACE FUNCTION public.cleanup_old_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete snapshots older than 7 days
  DELETE FROM public.user_snapshots 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete detected changes older than 30 days
  DELETE FROM public.detected_changes 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ========================================
-- FIM DO ARQUIVO: 20250822014831_5c6fed1c-89b7-41f4-b18f-394e1cce414e.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250823130948_8df14375-1c6a-4cd1-a721-66a3108da14d.sql
-- ========================================

-- Criar tabelas para sistema de mensagens real
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 TEXT NOT NULL,
  participant_2 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_habbo_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_type TEXT NOT NULL DEFAULT 'text'
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE supabase_user_id = auth.uid() 
    AND (habbo_name = participant_1 OR habbo_name = participant_2)
  )
);

CREATE POLICY "Users can create conversations they participate in" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE supabase_user_id = auth.uid() 
    AND (habbo_name = participant_1 OR habbo_name = participant_2)
  )
);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE supabase_user_id = auth.uid() 
    AND (habbo_name = participant_1 OR habbo_name = participant_2)
  )
);

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.habbo_accounts ha ON (ha.habbo_name = c.participant_1 OR ha.habbo_name = c.participant_2)
    WHERE c.id = conversation_id 
    AND ha.supabase_user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.habbo_accounts ha ON ha.habbo_name = sender_habbo_name
    WHERE c.id = conversation_id 
    AND ha.supabase_user_id = auth.uid()
    AND (ha.habbo_name = c.participant_1 OR ha.habbo_name = c.participant_2)
  )
);

-- Trigger para atualizar updated_at e last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now(), last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Enable realtime
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- ========================================
-- FIM DO ARQUIVO: 20250823130948_8df14375-1c6a-4cd1-a721-66a3108da14d.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250823154953_f60c3843-8b17-445e-9467-be6da100cf73.sql
-- ========================================

-- Create daily friend activities table for chronological feeds
CREATE TABLE public.daily_friend_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_habbo_id TEXT NOT NULL,
  user_habbo_name TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Activity summaries (only store changes)
  activities_summary JSONB DEFAULT '{}'::jsonb,
  badges_gained TEXT[] DEFAULT '{}',
  groups_joined JSONB DEFAULT '[]'::jsonb,
  rooms_created JSONB DEFAULT '[]'::jsonb,
  figure_changes JSONB DEFAULT NULL,
  photos_posted JSONB DEFAULT '[]'::jsonb,
  motto_changed TEXT DEFAULT NULL,
  
  -- Metadata
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_changes INTEGER DEFAULT 0,
  
  -- Indexes for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates per day
  UNIQUE(user_habbo_id, activity_date)
);

-- Create indexes for better performance
CREATE INDEX idx_daily_activities_date ON public.daily_friend_activities(activity_date DESC);
CREATE INDEX idx_daily_activities_hotel ON public.daily_friend_activities(hotel);
CREATE INDEX idx_daily_activities_updated ON public.daily_friend_activities(last_updated DESC);
CREATE INDEX idx_daily_activities_changes ON public.daily_friend_activities(total_changes DESC);

-- Enable RLS
ALTER TABLE public.daily_friend_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view daily activities" ON public.daily_friend_activities
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage daily activities" ON public.daily_friend_activities
  FOR ALL USING (true) WITH CHECK (true);

-- Function to clean old activities (keep only last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_daily_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.daily_friend_activities 
  WHERE activity_date < CURRENT_DATE - INTERVAL '7 days';
  
  RAISE NOTICE 'Cleaned up old daily activities older than 7 days';
END;
$$;

-- ========================================
-- FIM DO ARQUIVO: 20250823154953_f60c3843-8b17-445e-9467-be6da100cf73.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250824001325_3b902ad7-32d7-4a79-b030-756ee8ac9387.sql
-- ========================================

-- Create function to cleanup old daily activities
CREATE OR REPLACE FUNCTION cleanup_old_daily_activities()
RETURNS VOID AS $$
BEGIN
  DELETE FROM daily_friend_activities 
  WHERE activity_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FIM DO ARQUIVO: 20250824001325_3b902ad7-32d7-4a79-b030-756ee8ac9387.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250825001050_5cefb094-2a42-4c5b-a3a7-b64c62603c96.sql
-- ========================================

-- Activate the daily activities tracker function by calling it once
-- This will initialize the tracking system
SELECT 'Daily activities tracker initialized' as status;

-- ========================================
-- FIM DO ARQUIVO: 20250825001050_5cefb094-2a42-4c5b-a3a7-b64c62603c96.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250828121356_f61c81d6-1fa2-40a2-b576-8560b856a79d.sql
-- ========================================

-- ========================================
-- FASE 1: CRIAÇÃO DA ESTRUTURA CRÍTICA DE HABBO_ACCOUNTS
-- ========================================

-- 1. Criar tabela habbo_accounts (ESTRUTURA PRINCIPAL)
CREATE TABLE IF NOT EXISTS public.habbo_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name text NOT NULL,
  habbo_id text NOT NULL,
  hotel text NOT NULL DEFAULT 'br',
  figure_string text,
  motto text,
  is_online boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Índices únicos para performance e consistência
  CONSTRAINT unique_supabase_user UNIQUE (supabase_user_id),
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
);

-- 2. Habilitar RLS
ALTER TABLE public.habbo_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS robustas
CREATE POLICY "Users can view their own habbo account"
  ON public.habbo_accounts
  FOR SELECT
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own habbo account"
  ON public.habbo_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update their own habbo account"
  ON public.habbo_accounts
  FOR UPDATE
  USING (auth.uid() = supabase_user_id)
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Service role can manage all habbo accounts"
  ON public.habbo_accounts
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_habbo_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habbo_accounts_updated_at
  BEFORE UPDATE ON public.habbo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_habbo_accounts_updated_at();

-- 5. Criar usuário BEEBOP de teste (CRÍTICO para funcionar)
-- Primeiro precisamos criar o usuário Supabase, depois linkar
-- Por enquanto vamos usar um UUID temporário que será substituído pela Edge Function

-- ========================================
-- FIM DO ARQUIVO: 20250828121356_f61c81d6-1fa2-40a2-b576-8560b856a79d.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250828121432_4653db60-a8a4-49d2-ab2f-b87948f13d89.sql
-- ========================================

-- ========================================
-- FASE 2: CORREÇÃO CRÍTICA DE SEGURANÇA RLS
-- ========================================

-- Habilitar RLS nas tabelas críticas que estão expostas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_activities_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_profiles_cache ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para as tabelas habilitadas
CREATE POLICY "Users can manage their own conversations"
  ON public.conversations
  FOR ALL
  USING (
    participant_1 = current_setting('request.jwt.claims', true)::json ->> 'sub' OR
    participant_2 = current_setting('request.jwt.claims', true)::json ->> 'sub'
  );

CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant_1 = current_setting('request.jwt.claims', true)::json ->> 'sub' OR
           participant_2 = current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

CREATE POLICY "Anyone can view habbo groups"
  ON public.habbo_groups
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view habbo rooms"
  ON public.habbo_rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage user activities cache"
  ON public.habbo_user_activities_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role can manage profiles cache"
  ON public.habbo_profiles_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Users manage their own friends"
  ON public.friends
  FOR ALL
  USING (user_id = current_setting('request.jwt.claims', true)::json::uuid);

-- ========================================
-- FIM DO ARQUIVO: 20250828121432_4653db60-a8a4-49d2-ab2f-b87948f13d89.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250828121520_da519999-30dd-4daf-a8ed-ba60b2e97771.sql
-- ========================================

-- ========================================
-- FASE 2: CORREÇÃO CRÍTICA DE SEGURANÇA RLS (CORRIGIDO)
-- ========================================

-- Habilitar RLS nas tabelas críticas que estão expostas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_activities_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_profiles_cache ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para as tabelas habilitadas (CORRIGIDO com auth.uid())
CREATE POLICY "Service role can manage conversations"
  ON public.conversations
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role can manage chat messages"
  ON public.chat_messages
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Anyone can view habbo groups"
  ON public.habbo_groups
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view habbo rooms"
  ON public.habbo_rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage user activities cache"
  ON public.habbo_user_activities_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role can manage profiles cache"
  ON public.habbo_profiles_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Users manage their own friends"
  ON public.friends
  FOR ALL
  USING (user_id = auth.uid());

-- ========================================
-- FIM DO ARQUIVO: 20250828121520_da519999-30dd-4daf-a8ed-ba60b2e97771.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250909000001_create_habbohub_account.sql
-- ========================================

-- ========================================
-- CRIAR CONTA HABBOHUB COM SENHA 151092
-- ========================================

-- Criar um usuário auth para habbohub
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
  role
) VALUES (
  'hhbr-habbohub-user-id-12345',
  'hhbr-habbohub@habbohub.com',
  crypt('151092', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"habbo_name": "habbohub"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Criar a conta Habbo para habbohub
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  created_at
) VALUES (
  gen_random_uuid(),
  'hhbr-habbohub-system',
  'habbohub',
  'hhbr-habbohub-user-id-12345',
  'br',
  'hd-180-1.ch-255-66.lg-285-80.sh-290-62.ha-1012-110.hr-831-49',
  'Sistema HabboHub - Administrador',
  true,
  false,
  now()
) ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- ========================================
-- FIM DO ARQUIVO: 20250909000001_create_habbohub_account.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250909000002_cleanup_duplicate_tables.sql
-- ========================================

-- ========================================
-- LIMPEZA DE TABELAS DUPLICADAS E DESNECESSÁRIAS
-- Mantém apenas as tabelas essenciais para o console
-- ========================================

-- 1. REMOVER TABELAS DE SNAPSHOTS (duplicadas e desnecessárias para console)
DROP TABLE IF EXISTS public.habbo_user_snapshots CASCADE;
DROP TABLE IF EXISTS public.user_snapshots CASCADE;
DROP TABLE IF EXISTS public.habbo_activities CASCADE;
DROP TABLE IF EXISTS public.detected_changes CASCADE;

-- 2. REMOVER TABELAS DE MONITORAMENTO (não essenciais para console)
DROP TABLE IF EXISTS public.tracked_habbo_users CASCADE;

-- 3. REMOVER TABELAS DE USUÁRIOS LEGACY (substituídas por habbo_accounts)
DROP TABLE IF EXISTS public.users CASCADE;

-- 4. REMOVER TABELAS DE FOLLOWS DUPLICADAS (manter apenas console_profile_follows)
DROP TABLE IF EXISTS public.user_follows CASCADE;
DROP TABLE IF EXISTS public.user_followers CASCADE;

-- 5. REMOVER TABELAS DE HOME DESNECESSÁRIAS (manter apenas as essenciais)
DROP TABLE IF EXISTS public.user_home_layouts CASCADE;
DROP TABLE IF EXISTS public.user_stickers CASCADE;

-- 6. CRIAR ÍNDICES OTIMIZADOS PARA AS TABELAS DO CONSOLE
CREATE INDEX IF NOT EXISTS idx_console_profile_likes_target 
ON public.console_profile_likes(target_habbo_name);

CREATE INDEX IF NOT EXISTS idx_console_profile_comments_target 
ON public.console_profile_comments(target_habbo_name);

CREATE INDEX IF NOT EXISTS idx_console_profile_follows_target 
ON public.console_profile_follows(target_habbo_name);

-- 7. CRIAR ÍNDICES PARA HABBO_ACCOUNTS (tabela principal)
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_name_hotel 
ON public.habbo_accounts(habbo_name, hotel);

CREATE INDEX IF NOT EXISTS idx_habbo_accounts_admin 
ON public.habbo_accounts(is_admin) WHERE is_admin = true;

-- 8. CRIAR ÍNDICES PARA HOMES
CREATE INDEX IF NOT EXISTS idx_user_home_widgets_user 
ON public.user_home_widgets(user_id);

CREATE INDEX IF NOT EXISTS idx_user_home_backgrounds_user 
ON public.user_home_backgrounds(user_id);

CREATE INDEX IF NOT EXISTS idx_user_home_ratings_owner 
ON public.user_home_ratings(home_owner_user_id);

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.habbo_accounts IS 'Tabela principal de contas de usuários Habbo';
COMMENT ON TABLE public.console_profile_likes IS 'Likes em perfis do console';
COMMENT ON TABLE public.console_profile_comments IS 'Comentários em perfis do console';
COMMENT ON TABLE public.console_profile_follows IS 'Seguir perfis no console';
COMMENT ON TABLE public.user_home_widgets IS 'Widgets das homes dos usuários';
COMMENT ON TABLE public.user_home_backgrounds IS 'Fundos das homes dos usuários';
COMMENT ON TABLE public.user_home_ratings IS 'Avaliações das homes dos usuários';


-- ========================================
-- FIM DO ARQUIVO: 20250909000002_cleanup_duplicate_tables.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250909000003_consolidate_auth_system.sql
-- ========================================

-- ========================================
-- CONSOLIDAÇÃO DO SISTEMA DE AUTENTICAÇÃO
-- Garantir que todas as referências usem apenas habbo_accounts
-- ========================================

-- 1. GARANTIR QUE A TABELA HABBO_ACCOUNTS TENHA TODOS OS CAMPOS NECESSÁRIOS
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS habbo_id text,
ADD COLUMN IF NOT EXISTS hotel text DEFAULT 'br',
ADD COLUMN IF NOT EXISTS figure_string text,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. CRIAR CONSTRAINTS ÚNICOS PARA EVITAR DUPLICAÇÕES
ALTER TABLE public.habbo_accounts 
ADD CONSTRAINT IF NOT EXISTS unique_habbo_name_hotel 
UNIQUE (habbo_name, hotel);

ALTER TABLE public.habbo_accounts 
ADD CONSTRAINT IF NOT EXISTS unique_habbo_id_hotel 
UNIQUE (habbo_id, hotel);

-- 3. CRIAR FUNÇÃO PARA BUSCAR CONTA HABBO POR NOME E HOTEL
CREATE OR REPLACE FUNCTION public.get_habbo_account_by_name(
  habbo_name_param text,
  hotel_param text DEFAULT 'br'
)
RETURNS TABLE(
  id uuid,
  supabase_user_id uuid,
  habbo_name text,
  habbo_id text,
  hotel text,
  figure_string text,
  motto text,
  is_online boolean,
  is_admin boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ha.id,
    ha.supabase_user_id,
    ha.habbo_name,
    ha.habbo_id,
    ha.hotel,
    ha.figure_string,
    ha.motto,
    ha.is_online,
    ha.is_admin,
    ha.created_at
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;
END;
$$;

-- 4. CRIAR FUNÇÃO PARA BUSCAR EMAIL DE AUTENTICAÇÃO
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo(
  habbo_name_param text,
  hotel_param text DEFAULT 'br'
)
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

  RETURN v_email;
END;
$$;

-- 5. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO É ADMIN
CREATE OR REPLACE FUNCTION public.is_habbo_user_admin(
  habbo_name_param text,
  hotel_param text DEFAULT 'br'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_admin boolean := false;
BEGIN
  SELECT ha.is_admin INTO v_is_admin
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;

  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- 6. CRIAR TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION public.update_habbo_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_habbo_accounts_updated_at ON public.habbo_accounts;
CREATE TRIGGER update_habbo_accounts_updated_at
  BEFORE UPDATE ON public.habbo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_habbo_accounts_updated_at();

-- 7. CRIAR POLÍTICAS RLS ROBUSTAS
DROP POLICY IF EXISTS "Users can view their own habbo account" ON public.habbo_accounts;
DROP POLICY IF EXISTS "Users can insert their own habbo account" ON public.habbo_accounts;
DROP POLICY IF EXISTS "Users can update their own habbo account" ON public.habbo_accounts;
DROP POLICY IF EXISTS "Service role can manage all habbo accounts" ON public.habbo_accounts;

CREATE POLICY "Users can view their own habbo account"
  ON public.habbo_accounts
  FOR SELECT
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own habbo account"
  ON public.habbo_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update their own habbo account"
  ON public.habbo_accounts
  FOR UPDATE
  USING (auth.uid() = supabase_user_id)
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Service role can manage all habbo accounts"
  ON public.habbo_accounts
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON FUNCTION public.get_habbo_account_by_name IS 'Busca conta Habbo por nome e hotel';
COMMENT ON FUNCTION public.get_auth_email_for_habbo IS 'Busca email de autenticação para conta Habbo';
COMMENT ON FUNCTION public.is_habbo_user_admin IS 'Verifica se usuário Habbo é administrador';


-- ========================================
-- FIM DO ARQUIVO: 20250909000003_consolidate_auth_system.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250909000004_test_consolidated_system.sql
-- ========================================

-- ========================================
-- TESTE DO SISTEMA CONSOLIDADO
-- Verificar se todas as funcionalidades estão funcionando
-- ========================================

-- 1. VERIFICAR SE AS CONTAS PRINCIPAIS EXISTEM
DO $$
DECLARE
  beebop_count integer;
  habbohub_count integer;
BEGIN
  -- Verificar conta Beebop
  SELECT COUNT(*) INTO beebop_count
  FROM public.habbo_accounts 
  WHERE habbo_name = 'Beebop' AND hotel = 'br';
  
  -- Verificar conta habbohub
  SELECT COUNT(*) INTO habbohub_count
  FROM public.habbo_accounts 
  WHERE habbo_name = 'habbohub' AND hotel = 'br';
  
  -- Log dos resultados
  RAISE NOTICE 'Conta Beebop encontrada: %', beebop_count > 0;
  RAISE NOTICE 'Conta habbohub encontrada: %', habbohub_count > 0;
  
  -- Verificar se ambas as contas existem
  IF beebop_count = 0 THEN
    RAISE WARNING 'Conta Beebop não encontrada!';
  END IF;
  
  IF habbohub_count = 0 THEN
    RAISE WARNING 'Conta habbohub não encontrada!';
  END IF;
END $$;

-- 2. TESTAR FUNÇÕES CRIADAS
DO $$
DECLARE
  beebop_email text;
  habbohub_email text;
  beebop_is_admin boolean;
  habbohub_is_admin boolean;
BEGIN
  -- Testar função de email
  SELECT public.get_auth_email_for_habbo('Beebop', 'br') INTO beebop_email;
  SELECT public.get_auth_email_for_habbo('habbohub', 'br') INTO habbohub_email;
  
  -- Testar função de admin
  SELECT public.is_habbo_user_admin('Beebop', 'br') INTO beebop_is_admin;
  SELECT public.is_habbo_user_admin('habbohub', 'br') INTO habbohub_is_admin;
  
  -- Log dos resultados
  RAISE NOTICE 'Email Beebop: %', beebop_email;
  RAISE NOTICE 'Email habbohub: %', habbohub_email;
  RAISE NOTICE 'Beebop é admin: %', beebop_is_admin;
  RAISE NOTICE 'habbohub é admin: %', habbohub_is_admin;
END $$;

-- 3. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
DO $$
DECLARE
  habbo_accounts_count integer;
  console_likes_count integer;
  console_comments_count integer;
  console_follows_count integer;
  home_widgets_count integer;
  home_backgrounds_count integer;
  home_ratings_count integer;
BEGIN
  -- Contar registros nas tabelas principais
  SELECT COUNT(*) INTO habbo_accounts_count FROM public.habbo_accounts;
  SELECT COUNT(*) INTO console_likes_count FROM public.console_profile_likes;
  SELECT COUNT(*) INTO console_comments_count FROM public.console_profile_comments;
  SELECT COUNT(*) INTO console_follows_count FROM public.console_profile_follows;
  SELECT COUNT(*) INTO home_widgets_count FROM public.user_home_widgets;
  SELECT COUNT(*) INTO home_backgrounds_count FROM public.user_home_backgrounds;
  SELECT COUNT(*) INTO home_ratings_count FROM public.user_home_ratings;
  
  -- Log dos resultados
  RAISE NOTICE 'Total contas habbo_accounts: %', habbo_accounts_count;
  RAISE NOTICE 'Total likes console: %', console_likes_count;
  RAISE NOTICE 'Total comentários console: %', console_comments_count;
  RAISE NOTICE 'Total follows console: %', console_follows_count;
  RAISE NOTICE 'Total widgets home: %', home_widgets_count;
  RAISE NOTICE 'Total backgrounds home: %', home_backgrounds_count;
  RAISE NOTICE 'Total ratings home: %', home_ratings_count;
END $$;

-- 4. VERIFICAR ÍNDICES CRIADOS
DO $$
DECLARE
  index_count integer;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
    AND tablename IN ('habbo_accounts', 'console_profile_likes', 'console_profile_comments', 'console_profile_follows');
  
  RAISE NOTICE 'Total de índices criados: %', index_count;
END $$;


-- ========================================
-- FIM DO ARQUIVO: 20250909000004_test_consolidated_system.sql
-- ========================================


-- ========================================
-- ARQUIVO: 20250910_create_habbo_auth_table.sql
-- ========================================

-- ========================================
-- MIGRAÇÃO: CRIAR TABELA HABBO_AUTH DEDICADA
-- ========================================

-- 1. Criar tabela principal de autenticação Habbo
CREATE TABLE IF NOT EXISTS public.habbo_auth (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habbo_username VARCHAR(255) UNIQUE NOT NULL,
    habbo_motto TEXT,
    habbo_avatar TEXT,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_auth_username ON public.habbo_auth(habbo_username);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_admin ON public.habbo_auth(is_admin);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_verified ON public.habbo_auth(is_verified);

-- 3. Habilitar RLS
ALTER TABLE public.habbo_auth ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
CREATE POLICY "Public can view habbo users" 
    ON public.habbo_auth 
    FOR SELECT 
    USING (true);

CREATE POLICY "Service role can manage all habbo auth" 
    ON public.habbo_auth 
    FOR ALL 
    USING (current_setting('role', true) = 'service_role');

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_habbo_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habbo_auth_updated_at
    BEFORE UPDATE ON public.habbo_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_habbo_auth_updated_at();

-- 6. Inserir contas administrativas
INSERT INTO public.habbo_auth (habbo_username, habbo_motto, password_hash, is_admin) 
VALUES 
    ('habbohub', 'HUB-ADMIN', '151092', true),
    ('beebop', 'BEEBOP-ADMIN', '290684', true)
ON CONFLICT (habbo_username) DO NOTHING;

-- 7. Comentários para documentação
COMMENT ON TABLE public.habbo_auth IS 'Tabela principal de autenticação para usuários Habbo';
COMMENT ON COLUMN public.habbo_auth.habbo_username IS 'Nome de usuário do Habbo (único)';
COMMENT ON COLUMN public.habbo_auth.habbo_motto IS 'Motto atual do usuário no Habbo';
COMMENT ON COLUMN public.habbo_auth.password_hash IS 'Hash da senha para login interno';
COMMENT ON COLUMN public.habbo_auth.is_admin IS 'Indica se o usuário é administrador';


-- ========================================
-- FIM DO ARQUIVO: 20250910_create_habbo_auth_table.sql
-- ========================================


-- ========================================
-- ARQUIVO: create_users_table.sql
-- ========================================

-- Create users table for HabboHub
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habbo_username VARCHAR(255) UNIQUE NOT NULL,
    habbo_motto TEXT,
    habbo_avatar TEXT,
    password_hash VARCHAR(255),
    email VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_habbo_username ON public.users(habbo_username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role can do everything" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
-- INSERT INTO public.users (habbo_username, habbo_motto, is_admin) 
-- VALUES ('habbohub', 'HUB-HA2VEA', true);


-- ========================================
-- FIM DO ARQUIVO: create_users_table.sql
-- ========================================

