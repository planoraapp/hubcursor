-- ========================================
-- SQL CORRIGIDO - UNIFIED_USERS - HABBOHUB
-- ========================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. CRIAR TABELA UNIFICADA DE USUÁRIOS
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
  
  -- Constraints únicos (corrigidos)
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel)
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_unified_users_habbo_name ON public.unified_users(habbo_name);
CREATE INDEX IF NOT EXISTS idx_unified_users_hotel ON public.unified_users(hotel);
CREATE INDEX IF NOT EXISTS idx_unified_users_supabase_id ON public.unified_users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_unified_users_active ON public.unified_users(is_active) WHERE is_active = true;

-- 3. HABILITAR RLS
ALTER TABLE public.unified_users ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS
CREATE POLICY "Users can view own data" ON public.unified_users
  FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update own data" ON public.unified_users
  FOR UPDATE USING (auth.uid() = supabase_user_id)
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert own data" ON public.unified_users
  FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Service role can do everything" ON public.unified_users
  FOR ALL USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- 5. CRIAR TRIGGER
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

-- 6. CRIAR USUÁRIOS PADRÃO
INSERT INTO public.unified_users (habbo_name, hotel, is_admin, is_active, motto, member_since, email)
SELECT 'habbohub', 'br', true, true, 'HUB-HA2VEA', NOW(), 'habbohub@habbohub.com'
WHERE NOT EXISTS (SELECT 1 FROM public.unified_users WHERE habbo_name = 'habbohub' AND hotel = 'br');

INSERT INTO public.unified_users (habbo_name, hotel, password_hash, is_active, motto, member_since, email)
SELECT 'beebop', 'br', '$2a$10$example_hash', true, 'Teste', NOW(), 'beebop@habbohub.com'
WHERE NOT EXISTS (SELECT 1 FROM public.unified_users WHERE habbo_name = 'beebop' AND hotel = 'br');

-- 7. CRIAR VIEW PARA COMPATIBILIDADE
CREATE OR REPLACE VIEW public.habbo_accounts AS
SELECT 
  id, supabase_user_id, habbo_name, habbo_id, hotel, figure_string, motto, 
  is_online, is_admin, created_at, updated_at
FROM public.unified_users
WHERE is_active = true;

-- 8. CRIAR FUNÇÕES ÚTEIS
CREATE OR REPLACE FUNCTION get_user_by_habbo_name(
  p_habbo_name TEXT,
  p_hotel TEXT DEFAULT 'br'
)
RETURNS TABLE (
  id UUID, habbo_name TEXT, hotel TEXT, is_admin BOOLEAN, is_active BOOLEAN, created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.habbo_name, u.hotel, u.is_admin, u.is_active, u.created_at
  FROM public.unified_users u
  WHERE LOWER(u.habbo_name) = LOWER(p_habbo_name)
    AND u.hotel = p_hotel
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
