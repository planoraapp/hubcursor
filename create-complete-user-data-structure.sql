-- ========================================
-- ESTRUTURA COMPLETA PARA DADOS DE USUÁRIOS HABBO
-- ========================================

-- 1. Tabela principal de usuários Habbo
CREATE TABLE IF NOT EXISTS public.habbo_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name text NOT NULL,
  habbo_id text NOT NULL,
  hotel text NOT NULL DEFAULT 'br',
  
  -- Dados básicos do perfil
  figure_string text,
  motto text,
  is_online boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  password_hash text, -- Para senhas especiais
  
  -- Dados de progresso
  current_level integer DEFAULT 1,
  current_level_complete_percent integer DEFAULT 0,
  total_experience integer DEFAULT 0,
  star_gem_count integer DEFAULT 0,
  
  -- Dados de perfil
  profile_visible boolean DEFAULT true,
  member_since timestamp with time zone,
  last_access timestamp with time zone DEFAULT now(),
  
  -- Dados sociais (JSONB para flexibilidade)
  selected_badges jsonb DEFAULT '[]'::jsonb,
  badges_data jsonb DEFAULT '{}'::jsonb,
  groups_data jsonb DEFAULT '{}'::jsonb,
  friends_data jsonb DEFAULT '{}'::jsonb,
  rooms_data jsonb DEFAULT '{}'::jsonb,
  achievements_data jsonb DEFAULT '{}'::jsonb,
  
  -- Dados completos da API (backup)
  full_api_data jsonb DEFAULT '{}'::jsonb,
  
  -- Metadados
  data_collected_at timestamp with time zone DEFAULT now(),
  data_source text DEFAULT 'habbo.com.br',
  collection_method text DEFAULT 'api_direct',
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Índices únicos
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
);

-- 2. Tabela para emblemas (relacionamento normalizado)
CREATE TABLE IF NOT EXISTS public.habbo_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  badge_code text NOT NULL,
  badge_name text,
  badge_description text,
  is_selected boolean DEFAULT false,
  obtained_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Tabela para grupos
CREATE TABLE IF NOT EXISTS public.habbo_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  group_id text NOT NULL,
  group_name text,
  group_description text,
  group_type text,
  member_count integer,
  is_member boolean DEFAULT true,
  joined_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Tabela para amigos
CREATE TABLE IF NOT EXISTS public.habbo_friends (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  friend_habbo_name text NOT NULL,
  friend_habbo_id text,
  friend_hotel text,
  is_online boolean DEFAULT false,
  friendship_created_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Tabela para quartos
CREATE TABLE IF NOT EXISTS public.habbo_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  room_id text NOT NULL,
  room_name text,
  room_description text,
  room_category text,
  max_visitors integer,
  current_visitors integer,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Tabela para conquistas
CREATE TABLE IF NOT EXISTS public.habbo_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  achievement_name text,
  achievement_description text,
  progress integer DEFAULT 0,
  max_progress integer DEFAULT 100,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Habilitar RLS em todas as tabelas
ALTER TABLE public.habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_achievements ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para habbo_users
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

-- 9. Políticas RLS para tabelas relacionadas
CREATE POLICY "Public can manage habbo badges"
  ON public.habbo_badges
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can manage habbo groups"
  ON public.habbo_groups
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can manage habbo friends"
  ON public.habbo_friends
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can manage habbo rooms"
  ON public.habbo_rooms
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can manage habbo achievements"
  ON public.habbo_achievements
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 10. Índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_users_name_hotel ON public.habbo_users (habbo_name, hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_users_habbo_id ON public.habbo_users (habbo_id);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_admin ON public.habbo_users (is_admin);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_online ON public.habbo_users (is_online);

CREATE INDEX IF NOT EXISTS idx_habbo_badges_user_id ON public.habbo_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_code ON public.habbo_badges (badge_code);
CREATE INDEX IF NOT EXISTS idx_habbo_groups_user_id ON public.habbo_groups (user_id);
CREATE INDEX IF NOT EXISTS idx_habbo_friends_user_id ON public.habbo_friends (user_id);
CREATE INDEX IF NOT EXISTS idx_habbo_rooms_user_id ON public.habbo_rooms (user_id);
CREATE INDEX IF NOT EXISTS idx_habbo_achievements_user_id ON public.habbo_achievements (user_id);

-- 11. Triggers para updated_at
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

-- 12. Inserir usuário habbohub com dados completos
INSERT INTO public.habbo_users (
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  password_hash,
  current_level,
  total_experience,
  profile_visible,
  member_since,
  selected_badges,
  full_api_data
) VALUES (
  'habbohub',
  'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  'br',
  'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  'HUB-QQ797',
  true,
  false,
  '151092',
  1,
  0,
  false,
  now(),
  '[]'::jsonb,
  '{"source": "habbo.com.br", "collected_at": "2025-01-28T00:00:00Z"}'::jsonb
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  is_admin = EXCLUDED.is_admin,
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- 13. Comentários
COMMENT ON TABLE public.habbo_users IS 'Tabela principal para usuários Habbo com todos os dados coletados das APIs';
COMMENT ON TABLE public.habbo_badges IS 'Emblemas dos usuários Habbo';
COMMENT ON TABLE public.habbo_groups IS 'Grupos dos usuários Habbo';
COMMENT ON TABLE public.habbo_friends IS 'Amigos dos usuários Habbo';
COMMENT ON TABLE public.habbo_rooms IS 'Quartos dos usuários Habbo';
COMMENT ON TABLE public.habbo_achievements IS 'Conquistas dos usuários Habbo';
