
-- Adicionar coluna is_admin na tabela habbo_accounts se não existir
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Tabela para Posts do Fórum
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_supabase_user_id uuid NOT NULL,
  author_habbo_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  likes integer DEFAULT 0 NOT NULL,
  CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
  CONSTRAINT forum_posts_author_supabase_user_id_fkey FOREIGN KEY (author_supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela para Comentários do Fórum
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  post_id uuid NOT NULL,
  content text NOT NULL,
  author_supabase_user_id uuid NOT NULL,
  author_habbo_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
  CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT forum_comments_author_supabase_user_id_fkey FOREIGN KEY (author_supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para forum_posts
CREATE POLICY "Enable read access for all users" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_supabase_user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.forum_posts FOR DELETE USING (auth.uid() = author_supabase_user_id);

-- Políticas de RLS para forum_comments
CREATE POLICY "Enable read access for all users" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.forum_comments FOR UPDATE USING (auth.uid() = author_supabase_user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.forum_comments FOR DELETE USING (auth.uid() = author_supabase_user_id);
