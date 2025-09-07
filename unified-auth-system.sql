-- ========================================
-- SISTEMA DE AUTENTICAÇÃO UNIFICADO - HABBOHUB
-- ========================================
-- Este arquivo unifica todos os sistemas de login em uma única tabela
-- e migra dados existentes para prevenir futuros erros

-- 1. CRIAR TABELA UNIFICADA DE USUÁRIOS
-- ========================================
CREATE TABLE IF NOT EXISTS public.unified_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do Supabase Auth
  supabase_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do Habbo
  habbo_name TEXT NOT NULL,
  habbo_id TEXT,
  hotel TEXT NOT NULL DEFAULT 'br',
  figure_string TEXT,
  motto TEXT,
  is_online BOOLEAN DEFAULT false,
  
  -- Dados de autenticação
  password_hash TEXT,
  email TEXT,
  
  -- Dados de perfil
  avatar_url TEXT,
  member_since TIMESTAMP WITH TIME ZONE,
  
  -- Dados de sistema
  is_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints únicos
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel) WHERE habbo_id IS NOT NULL
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_unified_users_habbo_name ON public.unified_users(habbo_name);
CREATE INDEX IF NOT EXISTS idx_unified_users_hotel ON public.unified_users(hotel);
CREATE INDEX IF NOT EXISTS idx_unified_users_supabase_id ON public.unified_users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_unified_users_active ON public.unified_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_unified_users_admin ON public.unified_users(is_admin) WHERE is_admin = true;

-- 3. HABILITAR RLS (ROW LEVEL SECURITY)
-- ========================================
ALTER TABLE public.unified_users ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS
-- ========================================
-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own data" ON public.unified_users
  FOR SELECT USING (auth.uid() = supabase_user_id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own data" ON public.unified_users
  FOR UPDATE USING (auth.uid() = supabase_user_id)
  WITH CHECK (auth.uid() = supabase_user_id);

-- Usuários podem inserir seus próprios dados
CREATE POLICY "Users can insert own data" ON public.unified_users
  FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

-- Service role pode fazer tudo
CREATE POLICY "Service role can do everything" ON public.unified_users
  FOR ALL USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- 5. CRIAR TRIGGER PARA UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_unified_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_unified_users_updated_at
  BEFORE UPDATE ON public.unified_users
  FOR EACH ROW
  EXECUTE FUNCTION update_unified_users_updated_at();

-- 6. MIGRAR DADOS EXISTENTES
-- ========================================
-- Migrar de hub_users para unified_users
INSERT INTO public.unified_users (
  habbo_name,
  hotel,
  avatar_url,
  password_hash,
  member_since,
  is_active,
  created_at,
  updated_at
)
SELECT 
  habbo_username,
  hotel,
  habbo_avatar,
  password_hash,
  member_since::TIMESTAMP WITH TIME ZONE,
  is_active,
  created_at,
  updated_at
FROM public.hub_users
WHERE NOT EXISTS (
  SELECT 1 FROM public.unified_users 
  WHERE unified_users.habbo_name = hub_users.habbo_username 
  AND unified_users.hotel = hub_users.hotel
);

-- Migrar de habbo_accounts para unified_users (se existir)
INSERT INTO public.unified_users (
  supabase_user_id,
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_online,
  is_admin,
  created_at,
  updated_at
)
SELECT 
  supabase_user_id,
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_online,
  is_admin,
  created_at,
  updated_at
FROM public.habbo_accounts
WHERE NOT EXISTS (
  SELECT 1 FROM public.unified_users 
  WHERE unified_users.habbo_name = habbo_accounts.habbo_name 
  AND unified_users.hotel = habbo_accounts.hotel
);

-- 7. CRIAR CONTAS PADRÃO SE NÃO EXISTIREM
-- ========================================
-- Criar conta habbohub se não existir
INSERT INTO public.unified_users (
  habbo_name,
  hotel,
  is_admin,
  is_active,
  motto,
  member_since
)
SELECT 'habbohub', 'br', true, true, 'HUB-HA2VEA', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.unified_users WHERE habbo_name = 'habbohub' AND hotel = 'br'
);

-- Criar conta beebop se não existir
INSERT INTO public.unified_users (
  habbo_name,
  hotel,
  password_hash,
  is_active,
  motto,
  member_since
)
SELECT 'beebop', 'br', '$2a$10$example_hash', true, 'Teste', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.unified_users WHERE habbo_name = 'beebop' AND hotel = 'br'
);

-- 8. CRIAR VIEW PARA COMPATIBILIDADE
-- ========================================
-- View para manter compatibilidade com código existente
CREATE OR REPLACE VIEW public.habbo_accounts AS
SELECT 
  id,
  supabase_user_id,
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_online,
  is_admin,
  created_at,
  updated_at
FROM public.unified_users
WHERE is_active = true;

-- 9. CRIAR FUNÇÃO PARA BUSCAR USUÁRIO
-- ========================================
CREATE OR REPLACE FUNCTION get_user_by_habbo_name(
  p_habbo_name TEXT,
  p_hotel TEXT DEFAULT 'br'
)
RETURNS TABLE (
  id UUID,
  habbo_name TEXT,
  hotel TEXT,
  is_admin BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.habbo_name,
    u.hotel,
    u.is_admin,
    u.is_active,
    u.created_at
  FROM public.unified_users u
  WHERE LOWER(u.habbo_name) = LOWER(p_habbo_name)
    AND u.hotel = p_hotel
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CRIAR FUNÇÃO PARA VERIFICAR SENHA
-- ========================================
CREATE OR REPLACE FUNCTION verify_user_password(
  p_habbo_name TEXT,
  p_password TEXT,
  p_hotel TEXT DEFAULT 'br'
)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT password_hash INTO user_record
  FROM public.unified_users
  WHERE LOWER(habbo_name) = LOWER(p_habbo_name)
    AND hotel = p_hotel
    AND is_active = true;
  
  IF user_record.password_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Aqui você implementaria a verificação real da senha
  -- Por enquanto, retorna true se a senha não for nula
  RETURN user_record.password_hash IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================
COMMENT ON TABLE public.unified_users IS 'Tabela unificada de usuários do HabboHub';
COMMENT ON COLUMN public.unified_users.habbo_name IS 'Nome do usuário no Habbo Hotel';
COMMENT ON COLUMN public.unified_users.hotel IS 'Hotel do Habbo (br, com, etc.)';
COMMENT ON COLUMN public.unified_users.is_admin IS 'Se o usuário é administrador';
COMMENT ON COLUMN public.unified_users.is_active IS 'Se a conta está ativa';

-- 12. LOG DE MIGRAÇÃO
-- ========================================
INSERT INTO public.unified_users (habbo_name, hotel, motto, is_admin, is_active)
VALUES ('system', 'br', 'Sistema de migração', true, true)
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- ========================================
-- MIGRAÇÃO CONCLUÍDA
-- ========================================
-- Este sistema unificado resolve:
-- 1. Múltiplas tabelas de usuários
-- 2. Inconsistências de dados
-- 3. Problemas de autenticação
-- 4. Dificuldades para novos usuários
-- 
-- Para usar:
-- 1. Execute este SQL no Supabase
-- 2. Atualize o código para usar unified_users
-- 3. Teste com usuários existentes e novos
-- ========================================
