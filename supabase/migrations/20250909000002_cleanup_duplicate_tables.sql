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
