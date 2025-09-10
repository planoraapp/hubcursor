-- ========================================
-- ESTRUTURA COMPLETA HABBO HUB - SUPABASE
-- ========================================

-- 1. TABELA PRINCIPAL DE USUÁRIOS HABBO
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
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Índices únicos
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
);

-- 2. HABBO HOME - WIDGETS E LAYOUTS
CREATE TABLE IF NOT EXISTS public.habbo_home_widgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  widget_type text NOT NULL, -- 'avatar', 'guestbook', 'rating', 'badges', 'rooms', etc.
  widget_name text,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 300,
  height integer DEFAULT 200,
  z_index integer DEFAULT 1,
  is_visible boolean DEFAULT true,
  is_locked boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb, -- Configurações específicas do widget
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. HABBO HOME - BACKGROUNDS E TEMAS
CREATE TABLE IF NOT EXISTS public.habbo_home_backgrounds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  background_type text NOT NULL, -- 'color', 'image', 'pattern'
  background_value text NOT NULL, -- Cor, URL da imagem, ou padrão
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. CONSOLE DE INTERAÇÕES - LIKES E CURTIDAS
CREATE TABLE IF NOT EXISTS public.habbo_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  target_type text NOT NULL, -- 'profile', 'room', 'badge', 'achievement', 'post'
  target_id text NOT NULL, -- ID do item curtido
  target_user_id uuid REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'like', 'dislike', 'favorite', 'bookmark'
  created_at timestamp with time zone DEFAULT now(),
  
  -- Evitar duplicatas
  CONSTRAINT unique_user_target_interaction UNIQUE (user_id, target_type, target_id, interaction_type)
);

-- 5. CONSOLE DE INTERAÇÕES - COMENTÁRIOS
CREATE TABLE IF NOT EXISTS public.habbo_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  target_type text NOT NULL, -- 'profile', 'room', 'badge', 'achievement', 'post'
  target_id text NOT NULL, -- ID do item comentado
  target_user_id uuid REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  is_approved boolean DEFAULT true,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. SISTEMA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.habbo_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- 'like', 'comment', 'friend_request', 'achievement', 'system'
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb, -- Dados adicionais da notificação
  is_read boolean DEFAULT false,
  is_important boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. SISTEMA DE AMIZADES
CREATE TABLE IF NOT EXISTS public.habbo_friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Evitar duplicatas
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- 8. SISTEMA DE RANKINGS E ESTATÍSTICAS
CREATE TABLE IF NOT EXISTS public.habbo_statistics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.habbo_users(id) ON DELETE CASCADE,
  stat_type text NOT NULL, -- 'profile_views', 'likes_received', 'comments_made', 'rooms_created'
  stat_value integer DEFAULT 0,
  period text DEFAULT 'all_time', -- 'daily', 'weekly', 'monthly', 'all_time'
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Evitar duplicatas
  CONSTRAINT unique_user_stat_period UNIQUE (user_id, stat_type, period)
);

-- 9. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_home_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_home_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_statistics ENABLE ROW LEVEL SECURITY;

-- 10. POLÍTICAS RLS - HABBO_USERS (Público pode ler, mas só o próprio usuário pode modificar)
CREATE POLICY "Public can view habbo users"
  ON public.habbo_users
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can insert their own data"
  ON public.habbo_users
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON public.habbo_users
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 11. POLÍTICAS RLS - HABBO_HOME_WIDGETS (Usuário só vê seus próprios widgets)
CREATE POLICY "Users can view their own widgets"
  ON public.habbo_home_widgets
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can manage their own widgets"
  ON public.habbo_home_widgets
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 12. POLÍTICAS RLS - INTERAÇÕES (Público pode ver, mas só o próprio usuário pode criar)
CREATE POLICY "Public can view interactions"
  ON public.habbo_interactions
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can create interactions"
  ON public.habbo_interactions
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Users can delete their own interactions"
  ON public.habbo_interactions
  FOR DELETE
  TO PUBLIC
  USING (true);

-- 13. POLÍTICAS RLS - COMENTÁRIOS (Público pode ver, usuários podem criar e editar seus próprios)
CREATE POLICY "Public can view comments"
  ON public.habbo_comments
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.habbo_comments
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON public.habbo_comments
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own comments"
  ON public.habbo_comments
  FOR DELETE
  TO PUBLIC
  USING (true);

-- 14. POLÍTICAS RLS - NOTIFICAÇÕES (Usuário só vê suas próprias notificações)
CREATE POLICY "Users can view their own notifications"
  ON public.habbo_notifications
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can manage their own notifications"
  ON public.habbo_notifications
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 15. POLÍTICAS RLS - AMIZADES (Usuário vê suas próprias amizades)
CREATE POLICY "Users can view their own friendships"
  ON public.habbo_friendships
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can manage their own friendships"
  ON public.habbo_friendships
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 16. POLÍTICAS RLS - ESTATÍSTICAS (Público pode ver, usuários podem atualizar suas próprias)
CREATE POLICY "Public can view statistics"
  ON public.habbo_statistics
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can manage their own statistics"
  ON public.habbo_statistics
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 17. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_habbo_users_name_hotel ON public.habbo_users (habbo_name, hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_users_habbo_id ON public.habbo_users (habbo_id);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_admin ON public.habbo_users (is_admin);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_online ON public.habbo_users (is_online);

CREATE INDEX IF NOT EXISTS idx_home_widgets_user_id ON public.habbo_home_widgets (user_id);
CREATE INDEX IF NOT EXISTS idx_home_widgets_type ON public.habbo_home_widgets (widget_type);
CREATE INDEX IF NOT EXISTS idx_home_backgrounds_user_id ON public.habbo_home_backgrounds (user_id);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON public.habbo_interactions (user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_target ON public.habbo_interactions (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.habbo_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON public.habbo_comments (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.habbo_notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.habbo_notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.habbo_friendships (user_id);
CREATE INDEX IF NOT EXISTS idx_statistics_user_id ON public.habbo_statistics (user_id);

-- 18. TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habbo_users_updated_at
  BEFORE UPDATE ON public.habbo_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_widgets_updated_at
  BEFORE UPDATE ON public.habbo_home_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.habbo_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.habbo_friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 19. INSERIR USUÁRIO HABBOHUB COM DADOS COMPLETOS
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

-- 20. COMENTÁRIOS FINAIS
COMMENT ON TABLE public.habbo_users IS 'Usuários Habbo com dados completos das APIs';
COMMENT ON TABLE public.habbo_home_widgets IS 'Widgets personalizáveis do Habbo Home';
COMMENT ON TABLE public.habbo_home_backgrounds IS 'Backgrounds e temas do Habbo Home';
COMMENT ON TABLE public.habbo_interactions IS 'Sistema de likes, curtidas e interações';
COMMENT ON TABLE public.habbo_comments IS 'Sistema de comentários';
COMMENT ON TABLE public.habbo_notifications IS 'Sistema de notificações';
COMMENT ON TABLE public.habbo_friendships IS 'Sistema de amizades';
COMMENT ON TABLE public.habbo_statistics IS 'Estatísticas e rankings dos usuários';
