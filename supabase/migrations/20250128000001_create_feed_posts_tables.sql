-- ========================================
-- CREATE FEED POSTS TABLES
-- ========================================
-- Esta migration cria as tabelas para o feed de posts:
-- feed_posts, feed_post_likes, feed_post_comments

-- Tabela de posts do feed
CREATE TABLE IF NOT EXISTS feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 300),
  hotel TEXT DEFAULT 'br',
  figure_string TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de likes dos posts
CREATE TABLE IF NOT EXISTS feed_post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Tabela de comentários dos posts
CREATE TABLE IF NOT EXISTS feed_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 300),
  hotel TEXT DEFAULT 'br',
  figure_string TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_feed_posts_hotel ON feed_posts(hotel);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_likes_post_id ON feed_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_likes_user_id ON feed_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_comments_post_id ON feed_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_comments_created_at ON feed_post_comments(created_at);

-- Enable RLS
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies para feed_posts
CREATE POLICY "Users can view all posts" ON feed_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own posts" ON feed_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON feed_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON feed_posts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para feed_post_likes
CREATE POLICY "Users can view all likes" ON feed_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own likes" ON feed_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON feed_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para feed_post_comments
CREATE POLICY "Users can view all comments" ON feed_post_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own comments" ON feed_post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON feed_post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_feed_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feed_posts_updated_at 
  BEFORE UPDATE ON feed_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_feed_posts_updated_at();

-- Comentários para documentação
COMMENT ON TABLE feed_posts IS 'Armazena os posts do feed de usuários';
COMMENT ON TABLE feed_post_likes IS 'Armazena os likes dados pelos usuários nos posts';
COMMENT ON TABLE feed_post_comments IS 'Armazena os comentários dos usuários nos posts';
