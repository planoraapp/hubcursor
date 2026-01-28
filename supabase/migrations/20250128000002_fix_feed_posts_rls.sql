-- ========================================
-- FIX FEED POSTS RLS POLICIES
-- ========================================
-- Ajusta as políticas RLS para não depender de auth.uid()
-- já que o sistema não usa Supabase Auth
-- O controle de acesso será feito via aplicação

-- Remover políticas antigas que dependem de auth.uid()
DROP POLICY IF EXISTS "Users can view all posts" ON feed_posts;
DROP POLICY IF EXISTS "Authenticated users can insert their own posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON feed_posts;

DROP POLICY IF EXISTS "Users can view all likes" ON feed_post_likes;
DROP POLICY IF EXISTS "Authenticated users can insert their own likes" ON feed_post_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON feed_post_likes;

DROP POLICY IF EXISTS "Users can view all comments" ON feed_post_comments;
DROP POLICY IF EXISTS "Authenticated users can insert their own comments" ON feed_post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON feed_post_comments;

-- Desabilitar RLS temporariamente para permitir acesso via client
-- (O controle de acesso será feito via aplicação)
ALTER TABLE feed_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_comments DISABLE ROW LEVEL SECURITY;

-- Comentários explicativos
COMMENT ON TABLE feed_posts IS 'Armazena os posts do feed de usuários. RLS desabilitado - controle de acesso via aplicação.';
COMMENT ON TABLE feed_post_likes IS 'Armazena os likes dados pelos usuários nos posts. RLS desabilitado - controle de acesso via aplicação.';
COMMENT ON TABLE feed_post_comments IS 'Armazena os comentários dos usuários nos posts. RLS desabilitado - controle de acesso via aplicação.';
