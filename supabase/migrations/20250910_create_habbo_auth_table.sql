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
