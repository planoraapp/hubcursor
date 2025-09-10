-- ========================================
-- CRIAR TABELA SIMPLES PARA USUÁRIOS HABBO
-- ========================================

-- 1. Criar tabela habbo_users (sem foreign keys)
CREATE TABLE IF NOT EXISTS public.habbo_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name text NOT NULL,
  habbo_id text NOT NULL,
  hotel text NOT NULL DEFAULT 'br',
  figure_string text,
  motto text,
  is_online boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  password_hash text, -- Para senhas especiais
  last_access timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Índices únicos
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
);

-- 2. Habilitar RLS
ALTER TABLE public.habbo_users ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS simples
CREATE POLICY "Public can view habbo users"
  ON public.habbo_users
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public can insert habbo users"
  ON public.habbo_users
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Public can update habbo users"
  ON public.habbo_users
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete habbo users"
  ON public.habbo_users
  FOR DELETE
  TO PUBLIC
  USING (true);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_users_name_hotel 
ON public.habbo_users (habbo_name, hotel);

CREATE INDEX IF NOT EXISTS idx_habbo_users_habbo_id 
ON public.habbo_users (habbo_id);

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_habbo_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habbo_users_updated_at
  BEFORE UPDATE ON public.habbo_users
  FOR EACH ROW
  EXECUTE FUNCTION update_habbo_users_updated_at();

-- 6. Inserir usuário habbohub
INSERT INTO public.habbo_users (
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  password_hash
) VALUES (
  'habbohub',
  'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  'br',
  'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  'HUB-QQ797',
  true,
  false,
  '151092' -- Senha simples para teste
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  is_admin = EXCLUDED.is_admin,
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- 7. Comentários
COMMENT ON TABLE public.habbo_users IS 'Tabela simples para usuários Habbo sem dependências de Supabase Auth';
COMMENT ON COLUMN public.habbo_users.password_hash IS 'Hash da senha ou senha simples para contas especiais';
COMMENT ON COLUMN public.habbo_users.habbo_id IS 'ID real do usuário no Habbo (formato hh{hotel}-{hash})';
