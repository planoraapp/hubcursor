-- ========================================
-- MIGRAÇÃO PARA CRIAR TABELA HABBO_USERS COMPLETA
-- ========================================

-- 1. Dropar tabela existente se existir (cuidado!)
-- DROP TABLE IF EXISTS public.habbo_users CASCADE;

-- 2. Criar nova tabela habbo_users com estrutura completa
CREATE TABLE IF NOT EXISTS public.habbo_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name text NOT NULL,
  habbo_id text NOT NULL,
  hotel text NOT NULL DEFAULT 'br',
  figure_string text,
  motto text,
  is_online boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  password_hash text,
  profile_visible boolean DEFAULT true,
  member_since timestamp with time zone,
  last_access timestamp with time zone DEFAULT now(),
  current_level integer DEFAULT 1,
  total_experience integer DEFAULT 0,
  star_gem_count integer DEFAULT 0,
  selected_badges jsonb DEFAULT '[]'::jsonb,
  badges_data jsonb DEFAULT '{}'::jsonb,
  groups_data jsonb DEFAULT '{}'::jsonb,
  friends_data jsonb DEFAULT '{}'::jsonb,
  rooms_data jsonb DEFAULT '{}'::jsonb,
  achievements_data jsonb DEFAULT '{}'::jsonb,
  full_api_data jsonb DEFAULT '{}'::jsonb,
  data_collected_at timestamp with time zone DEFAULT now(),
  data_source text DEFAULT 'habbo.com.br',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Índices únicos
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
);

-- 3. Habilitar RLS
ALTER TABLE public.habbo_users ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
CREATE POLICY IF NOT EXISTS "Public can view habbo users"
  ON public.habbo_users
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own data"
  ON public.habbo_users
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own data"
  ON public.habbo_users
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_users_name_hotel ON public.habbo_users (habbo_name, hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_users_habbo_id ON public.habbo_users (habbo_id);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_admin ON public.habbo_users (is_admin);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_online ON public.habbo_users (is_online);

-- 6. Trigger para updated_at
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

-- 7. Inserir contas de admin
INSERT INTO public.habbo_users (
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  password_hash,
  profile_visible
) VALUES 
(
  'habbohub',
  'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  'br',
  'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  'HUB-QQ797',
  true,
  false,
  '151092',
  false
),
(
  'beebop',
  'hhbr-beebop-id',
  'br',
  'hr-100-0.hd-180-1',
  'BEEBOP-MOTTO',
  true,
  false,
  '290684',
  true
)
ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  is_admin = EXCLUDED.is_admin,
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- 8. Verificar se foi criado corretamente
SELECT 'Tabela habbo_users criada com sucesso!' as status;
SELECT habbo_name, habbo_id, is_admin, password_hash FROM public.habbo_users;
