
-- Criar tabela para posts do fórum
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_supabase_user_id UUID REFERENCES auth.users NOT NULL,
  author_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  likes INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Geral'
);

-- Criar tabela para comentários do fórum
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_supabase_user_id UUID REFERENCES auth.users NOT NULL,
  author_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar Row Level Security (RLS)
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para forum_posts - todos podem ver, apenas usuários autenticados podem criar/editar seus próprios posts
CREATE POLICY "Anyone can view forum posts" 
  ON public.forum_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.forum_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.forum_posts 
  FOR UPDATE 
  USING (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.forum_posts 
  FOR DELETE 
  USING (auth.uid() = author_supabase_user_id);

-- Políticas para forum_comments - todos podem ver, apenas usuários autenticados podem criar/editar seus próprios comentários
CREATE POLICY "Anyone can view forum comments" 
  ON public.forum_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.forum_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.forum_comments 
  FOR UPDATE 
  USING (auth.uid() = author_supabase_user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.forum_comments 
  FOR DELETE 
  USING (auth.uid() = author_supabase_user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS forum_posts_created_at_idx ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS forum_posts_category_idx ON public.forum_posts(category);
CREATE INDEX IF NOT EXISTS forum_posts_author_idx ON public.forum_posts(author_supabase_user_id);
CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS forum_comments_created_at_idx ON public.forum_comments(created_at ASC);
