-- ========================================
-- MIGRATION: HABBO HUB LOGIN SYSTEM (FIXED)
-- Sistema de login por código HUB-XXXXX
-- ========================================

-- Tabela de códigos de verificação temporários
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  hotel TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_username_hotel ON public.verification_codes(username, hotel);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- Tabela de usuários do HabboHub
CREATE TABLE IF NOT EXISTS public.hub_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habbo_username TEXT NOT NULL,
  hotel TEXT NOT NULL,
  habbo_avatar TEXT,
  password_hash TEXT NOT NULL,
  member_since TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(habbo_username, hotel)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_hub_users_username_hotel ON public.hub_users(habbo_username, hotel);
CREATE INDEX IF NOT EXISTS idx_hub_users_hotel ON public.hub_users(hotel);
CREATE INDEX IF NOT EXISTS idx_hub_users_active ON public.hub_users(is_active) WHERE is_active = TRUE;

-- Tabela de sessões ativas
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.hub_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para sessões
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Habilitar RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para verification_codes
CREATE POLICY "Allow service role to manage verification codes"
ON public.verification_codes
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Políticas de segurança para hub_users
CREATE POLICY "Allow service role to manage hub users"
ON public.hub_users
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Políticas de segurança para user_sessions
CREATE POLICY "Allow service role to manage user sessions"
ON public.user_sessions
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Função para limpar códigos expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hub_users_updated_at
  BEFORE UPDATE ON public.hub_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir conta Beebop se não existir
INSERT INTO public.hub_users (
  habbo_username,
  hotel,
  habbo_avatar,
  password_hash,
  member_since,
  created_at,
  is_active
) VALUES (
  'beebop',
  'br',
  'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&headonly=1',
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', -- hash da senha '151092'
  '2024-01-01',
  NOW(),
  TRUE
) ON CONFLICT (habbo_username, hotel) DO UPDATE SET
  habbo_avatar = EXCLUDED.habbo_avatar,
  updated_at = NOW();

-- Comentários para documentação
COMMENT ON TABLE public.verification_codes IS 'Códigos de verificação temporários HUB-XXXXX';
COMMENT ON TABLE public.hub_users IS 'Usuários do HabboHub com autenticação por senha';
COMMENT ON TABLE public.user_sessions IS 'Sessões ativas dos usuários';

COMMENT ON COLUMN public.verification_codes.code IS 'Código de verificação no formato HUB-XXXXX';
COMMENT ON COLUMN public.verification_codes.expires_at IS 'Data de expiração do código (10 minutos)';
COMMENT ON COLUMN public.hub_users.habbo_username IS 'Nome de usuário do Habbo (lowercase)';
COMMENT ON COLUMN public.hub_users.hotel IS 'Hotel do usuário (br, us, es, etc.)';
COMMENT ON COLUMN public.hub_users.password_hash IS 'Hash da senha do usuário (6+ caracteres)';
