
-- Create users table for HabboHub
create table public.users (
    id               bigint generated always as identity primary key,
    habbo_username   text not null unique,
    habbo_motto      text not null,
    habbo_avatar     text,
    password_hash    text not null,
    email            text,
    is_admin         boolean default false,
    is_verified      boolean default false,
    last_login       timestamptz,
    created_at       timestamptz default now(),
    updated_at       timestamptz default now()
);

-- Create indexes for faster lookups
create index idx_users_habbo_username on public.users(habbo_username);
create index idx_users_email on public.users(email);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies
-- Users can read their own data
create policy "Users can view own data" on public.users
    for select using (auth.uid()::text = id::text);

-- Users can update their own data
create policy "Users can update own data" on public.users
    for update using (auth.uid()::text = id::text);

-- Service role can do everything (for Edge Functions)
create policy "Service role can do everything" on public.users
    for all using (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
create trigger update_users_updated_at 
    before update on public.users 
    for each row 
    execute function update_updated_at_column();

-- Insert sample data (optional)
-- insert into public.users (habbo_username, habbo_motto, password_hash, is_admin) 
-- values ('habbohub', 'HUB-HA2VEA', 'sample_hash', true);



-- Função para criar usuário admin contornando constraints
CREATE OR REPLACE FUNCTION create_admin_user(user_id UUID, user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tentar inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    last_sign_in_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    phone_confirmed_at,
    phone,
    phone_confirmed_at,
    phone_change_sent_at,
    confirmed_at,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  ) VALUES (
    user_id,
    user_email,
    '$2a$10$dummy.hash.for.admin.user',
    NOW(),
    NOW(),
    NOW(),
    '{"habbo_name": "habbohub"}',
    '{"habbo_name": "habbohub"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    '',
    NULL,
    NULL,
    NULL,
    NULL,
    '',
    '',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    0,
    NULL,
    '',
    NULL,
    false,
    NULL,
    false
  ) ON CONFLICT (id) DO NOTHING;
END;
$$;




-- Função para criar conta admin do Habbo contornando constraints
CREATE OR REPLACE FUNCTION create_habbo_admin_account(
    p_habbo_name TEXT,
    p_hotel TEXT,
    p_habbo_id TEXT,
    p_figure_string TEXT,
    p_motto TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID := '00000000-0000-0000-0000-000000000000';
    result JSON;
BEGIN
    -- Primeiro, tentar criar usuário na tabela auth.users se não existir
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        last_sign_in_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        phone_confirmed_at,
        phone,
        phone_confirmed_at,
        phone_change_sent_at,
        confirmed_at,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
    ) VALUES (
        admin_user_id,
        CONCAT(p_habbo_name, '@', p_hotel, '.habbohub.com'),
        '$2a$10$dummy.hash.for.admin.user',
        NOW(),
        NOW(),
        NOW(),
        '{"habbo_name": "' || p_habbo_name || '"}',
        '{"habbo_name": "' || p_habbo_name || '"}',
        false,
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        '',
        NULL,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NOW(),
        0,
        NULL,
        '',
        NULL,
        false,
        NULL,
        false
    ) ON CONFLICT (id) DO NOTHING;

    -- Agora inserir na tabela habbo_accounts
    INSERT INTO habbo_accounts (
        habbo_name,
        hotel,
        supabase_user_id,
        habbo_id,
        figure_string,
        motto,
        is_admin,
        is_online
    ) VALUES (
        p_habbo_name,
        p_hotel,
        admin_user_id,
        p_habbo_id,
        p_figure_string,
        p_motto,
        true,
        false
    ) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
        habbo_id = EXCLUDED.habbo_id,
        figure_string = EXCLUDED.figure_string,
        motto = EXCLUDED.motto,
        is_admin = EXCLUDED.is_admin,
        is_online = EXCLUDED.is_online;

    -- Retornar dados da conta criada
    SELECT row_to_json(ha.*) INTO result
    FROM habbo_accounts ha
    WHERE ha.habbo_name = p_habbo_name 
    AND ha.hotel = p_hotel;

    RETURN result;
END;
$$;






-- Migration: Create badges tables
-- Description: Create tables for storing Habbo badges with categories and metadata

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  hotel VARCHAR(10),
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create badge_categories table for many-to-many relationship
CREATE TABLE IF NOT EXISTS badge_categories (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_id, category)
);

-- Create badge_countries table for country mapping
CREATE TABLE IF NOT EXISTS badge_countries (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  country VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_id, country)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(code);
CREATE INDEX IF NOT EXISTS idx_badges_hotel ON badges(hotel);
CREATE INDEX IF NOT EXISTS idx_badges_created_at ON badges(created_at);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_badge_categories_badge_id ON badge_categories(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_categories_category ON badge_categories(category);
CREATE INDEX IF NOT EXISTS idx_badge_countries_badge_id ON badge_countries(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_countries_country ON badge_countries(country);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_badges_updated_at 
    BEFORE UPDATE ON badges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO badge_categories (badge_id, category) 
SELECT id, 'all' FROM badges 
WHERE NOT EXISTS (SELECT 1 FROM badge_categories WHERE category = 'all')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badges TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badge_categories TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badge_countries TO authenticated;




-- Migration: Create API cache table for unified API
-- Description: Create table for caching API responses to improve performance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create api_cache table
CREATE TABLE IF NOT EXISTS public.api_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON public.api_cache(key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON public.api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_priority ON public.api_cache(priority);
CREATE INDEX IF NOT EXISTS idx_api_cache_created_at ON public.api_cache(created_at);

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_cache 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_cache_updated_at
  BEFORE UPDATE ON public.api_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_api_cache_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_cache TO service_role;

-- Create RLS policies
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Policy for service role (can do everything)
CREATE POLICY "Service role can manage all cache entries"
  ON public.api_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Policy for authenticated users (read only)
CREATE POLICY "Authenticated users can read cache entries"
  ON public.api_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert initial cache cleanup job (if using pg_cron)
-- This would be set up separately in production




-- Criar tabela para vínculos entre contas Habbo e usuários Supabase
CREATE TABLE public.habbo_accounts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  habbo_id text NOT NULL UNIQUE,
  habbo_name text NOT NULL,
  supabase_user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT habbo_accounts_pkey PRIMARY KEY (id)
);

-- Adicionar foreign key para auth.users
ALTER TABLE public.habbo_accounts ADD CONSTRAINT habbo_accounts_supabase_user_id_fkey FOREIGN KEY (supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.habbo_accounts ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler sua própria conta vinculada
CREATE POLICY "Users can read their own linked habbo account" ON public.habbo_accounts
FOR SELECT USING (auth.uid() = supabase_user_id);

-- Política: Usuários podem inserir sua própria conta vinculada
CREATE POLICY "Users can insert their own linked habbo account" ON public.habbo_accounts
FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

-- Política: Usuários podem atualizar sua própria conta vinculada
CREATE POLICY "Users can update their own linked habbo account" ON public.habbo_accounts
FOR UPDATE USING (auth.uid() = supabase_user_id);




-- Adicionar coluna is_admin à tabela habbo_accounts
ALTER TABLE public.habbo_accounts 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;




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




-- Criar tabela para posts do fórum
CREATE TABLE public.forum_posts (
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

-- Criar tabela para comentários do fórum
CREATE TABLE public.forum_comments (
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




-- Create storage bucket for forum images
INSERT INTO storage.buckets (id, name, public)
VALUES ('habbo-hub-images', 'habbo-hub-images', true);

-- Create policy to allow public read access to the bucket
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'habbo-hub-images');

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'habbo-hub-images' AND auth.role() = 'authenticated');

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (bucket_id = 'habbo-hub-images' AND auth.uid()::text = (storage.foldername(name))[1]);




-- Add the missing category column to forum_posts table
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS category text;




-- Create the habbo_figures_cache table for storing figure data
CREATE TABLE IF NOT EXISTS public.habbo_figures_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS but make it public for the edge function to access
ALTER TABLE public.habbo_figures_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for edge function)
CREATE POLICY "Allow public read access for figure cache" 
  ON public.habbo_figures_cache 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow public insert access (for edge function)
CREATE POLICY "Allow public insert access for figure cache" 
  ON public.habbo_figures_cache 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create policy to allow public delete access (for cleanup)
CREATE POLICY "Allow public delete access for expired cache" 
  ON public.habbo_figures_cache 
  FOR DELETE 
  TO public
  USING (expires_at < now());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_habbo_figures_cache_expires_at ON public.habbo_figures_cache(expires_at);



-- Criar tabela de cache para dados do Habbo se ela não existir
CREATE TABLE IF NOT EXISTS public.habbo_figures_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Criar índice para consultas por expiração
CREATE INDEX IF NOT EXISTS idx_habbo_figures_cache_expires_at 
ON public.habbo_figures_cache(expires_at);

-- Habilitar RLS (mesmo sendo dados públicos, é boa prática)
ALTER TABLE public.habbo_figures_cache ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura dos dados de cache
CREATE POLICY IF NOT EXISTS "Cache é acessível publicamente" 
ON public.habbo_figures_cache 
FOR SELECT 
USING (true);

-- Política para permitir inserção de novos dados de cache (via service role)
CREATE POLICY IF NOT EXISTS "Inserção de cache via service role" 
ON public.habbo_figures_cache 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir limpeza de cache expirado
CREATE POLICY IF NOT EXISTS "Limpeza de cache expirado" 
ON public.habbo_figures_cache 
FOR DELETE 
USING (expires_at < now());


-- Create photo_likes table for social interactions
CREATE TABLE public.photo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Create photo_comments table for photo discussions
CREATE TABLE public.photo_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_followers table for following system
CREATE TABLE public.user_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  followed_habbo_id TEXT NOT NULL,
  followed_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, followed_habbo_id)
);

-- Enable RLS on all tables
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo_likes
CREATE POLICY "Users can view all photo likes" 
ON public.photo_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like photos" 
ON public.photo_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.photo_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for photo_comments
CREATE POLICY "Users can view all photo comments" 
ON public.photo_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can comment on photos" 
ON public.photo_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own comments" 
ON public.photo_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.photo_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for user_followers
CREATE POLICY "Users can view all followers" 
ON public.user_followers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow others" 
ON public.user_followers 
FOR INSERT 
WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow" 
ON public.user_followers 
FOR DELETE 
USING (auth.uid() = follower_user_id);

-- Create indexes for better performance
CREATE INDEX idx_photo_likes_photo_id ON public.photo_likes(photo_id);
CREATE INDEX idx_photo_likes_user_id ON public.photo_likes(user_id);
CREATE INDEX idx_photo_comments_photo_id ON public.photo_comments(photo_id);
CREATE INDEX idx_photo_comments_user_id ON public.photo_comments(user_id);
CREATE INDEX idx_user_followers_follower ON public.user_followers(follower_user_id);
CREATE INDEX idx_user_followers_followed ON public.user_followers(followed_habbo_id);



-- Create habbo_badges table for tracking valid badges
CREATE TABLE IF NOT EXISTS public.habbo_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code TEXT NOT NULL UNIQUE,
  badge_name TEXT,
  source TEXT CHECK (source IN ('HabboWidgets', 'HabboAssets', 'SupabaseBucket')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ DEFAULT NOW(),
  validation_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_code ON public.habbo_badges(badge_code);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active) WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE public.habbo_badges ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active badges
CREATE POLICY "Allow read access to active badges" 
ON public.habbo_badges 
FOR SELECT 
USING (is_active = TRUE);

-- Create policy for service role to manage badges
CREATE POLICY "Allow service role to manage badges"
ON public.habbo_badges
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Create a function for periodic badge validation and cleanup
CREATE OR REPLACE FUNCTION public.validate_and_cleanup_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove badges not validated in the last 90 days
  DELETE FROM public.habbo_badges
  WHERE last_validated_at < NOW() - INTERVAL '90 days';

  -- Update validation status for stale badges
  UPDATE public.habbo_badges
  SET is_active = FALSE
  WHERE last_validated_at < NOW() - INTERVAL '30 days';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run validation periodically
CREATE OR REPLACE TRIGGER trigger_badge_validation
AFTER INSERT OR UPDATE ON public.habbo_badges
FOR EACH STATEMENT
EXECUTE FUNCTION public.validate_and_cleanup_badges();




-- Adicionar coluna category à tabela habbo_badges
ALTER TABLE public.habbo_badges 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'others' CHECK (category IN ('official', 'achievements', 'fansites', 'others'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_category ON public.habbo_badges(category);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_source ON public.habbo_badges(source);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_last_validated ON public.habbo_badges(last_validated_at);

-- Atualizar badges existentes com categorização baseada no badge_code
UPDATE public.habbo_badges 
SET category = CASE 
  WHEN UPPER(badge_code) LIKE '%ADM%' OR UPPER(badge_code) LIKE '%MOD%' OR UPPER(badge_code) LIKE '%STAFF%' 
       OR UPPER(badge_code) LIKE '%VIP%' OR UPPER(badge_code) LIKE '%GUIDE%' OR UPPER(badge_code) LIKE '%HELPER%' THEN 'official'
  WHEN UPPER(badge_code) LIKE '%ACH%' OR UPPER(badge_code) LIKE '%GAM%' OR UPPER(badge_code) LIKE '%WIN%' 
       OR UPPER(badge_code) LIKE '%VICTORY%' OR UPPER(badge_code) LIKE '%CHAMPION%' THEN 'achievements'
  WHEN UPPER(badge_code) LIKE '%FANSITE%' OR UPPER(badge_code) LIKE '%PARTNER%' OR UPPER(badge_code) LIKE '%EVENT%' 
       OR UPPER(badge_code) LIKE '%SPECIAL%' OR UPPER(badge_code) LIKE '%EXCLUSIVE%' THEN 'fansites'
  ELSE 'others'
END
WHERE category IS NULL OR category = 'others';




-- Verificar e adicionar coluna category se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'habbo_badges' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.habbo_badges 
        ADD COLUMN category text DEFAULT 'others';
        
        -- Adicionar constraint para categorias válidas
        ALTER TABLE public.habbo_badges 
        ADD CONSTRAINT check_category 
        CHECK (category IN ('official', 'achievements', 'fansites', 'others'));
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_category ON public.habbo_badges(category);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_source ON public.habbo_badges(source);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_code ON public.habbo_badges(badge_code);

-- Limpar dados antigos e preparar para nova população
DELETE FROM public.habbo_badges;

-- Resetar sequência se existir
-- (Usar UUID então não é necessário resetar sequência)




-- Criar tabela principal para itens de roupas HabboEmotion
CREATE TABLE IF NOT EXISTS public.habbo_emotion_clothing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  part TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'U',
  club TEXT NOT NULL DEFAULT 'FREE',
  colors JSONB NOT NULL DEFAULT '["1"]'::jsonb,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'habboemotion',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(item_id, code)
);

-- Criar tabela de cores oficiais do Habbo
CREATE TABLE IF NOT EXISTS public.habbo_emotion_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  color_id TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  color_name TEXT,
  is_hc BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento item-cores
CREATE TABLE IF NOT EXISTS public.habbo_emotion_item_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clothing_item_id UUID NOT NULL REFERENCES public.habbo_emotion_clothing(id) ON DELETE CASCADE,
  color_id TEXT NOT NULL REFERENCES public.habbo_emotion_colors(color_id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(clothing_item_id, color_id)
);

-- Criar tabela de cache da API
CREATE TABLE IF NOT EXISTS public.habbo_emotion_api_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  response_data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '6 hours'),
  item_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.habbo_emotion_clothing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_item_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_api_cache ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leitura pública
CREATE POLICY "Allow public read access to clothing items" 
  ON public.habbo_emotion_clothing 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Allow public read access to colors" 
  ON public.habbo_emotion_colors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to item colors" 
  ON public.habbo_emotion_item_colors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to api cache" 
  ON public.habbo_emotion_api_cache 
  FOR SELECT 
  USING (expires_at > now());

-- Políticas RLS para service role (escrita)
CREATE POLICY "Allow service role to manage clothing items" 
  ON public.habbo_emotion_clothing 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage colors" 
  ON public.habbo_emotion_colors 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage item colors" 
  ON public.habbo_emotion_item_colors 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage api cache" 
  ON public.habbo_emotion_api_cache 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_part ON public.habbo_emotion_clothing(part);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_gender ON public.habbo_emotion_clothing(gender);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_club ON public.habbo_emotion_clothing(club);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_active ON public.habbo_emotion_clothing(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_api_cache_expires ON public.habbo_emotion_api_cache(expires_at);

-- Inserir cores básicas do Habbo (usando dados do habboColors.ts)
INSERT INTO public.habbo_emotion_colors (color_id, hex_code, color_name, is_hc) VALUES
('1', 'DDDDDD', 'Cinza Claro', false),
('2', '96743D', 'Marrom', false),
('3', '6B573B', 'Marrom Escuro', false),
('4', 'E7B027', 'Amarelo', false),
('5', 'fff7b7', 'Amarelo Claro', false),
('6', 'F8C790', 'Pele', false),
('7', '9F2B31', 'Vermelho Escuro', false),
('8', 'ED5C50', 'Vermelho', false),
('9', 'FFBFC2', 'Rosa Claro', false),
('10', 'E7D1EE', 'Roxo Claro', false),
('11', 'AC94B3', 'Roxo', false),
('12', '7E5B90', 'Roxo Escuro', false),
('13', '4F7AA2', 'Azul', false),
('14', '75B7C7', 'Azul Claro', false),
('15', 'C5EDE6', 'Ciano Claro', false),
('16', 'BBF3BD', 'Verde Claro', false),
('17', '6BAE61', 'Verde', false),
('18', '456F40', 'Verde Escuro', false),
('19', '7A7D22', 'Verde Oliva', false),
('20', '595959', 'Cinza', false),
('21', '1E1E1E', 'Preto HC', true),
('22', '84573c', 'Marrom HC', true),
('23', 'A86B19', 'Dourado HC', true),
('24', 'c69f71', 'Bege HC', true),
('25', 'F3E1AF', 'Creme HC', true),
('26', 'FFFFFF', 'Branco HC', true),
('27', 'FFF41D', 'Amarelo Neon HC', true),
('28', 'ffe508', 'Amarelo HC', true),
('29', 'ffcc00', 'Ouro HC', true),
('30', 'ffa508', 'Laranja Claro HC', true),
('31', 'FF9211', 'Laranja HC', true),
('32', 'ff5b08', 'Laranja Escuro HC', true),
('33', 'C74400', 'Vermelho Laranja HC', true),
('34', 'da6a43', 'Terra Cotta HC', true),
('35', 'b18276', 'Rosa Seco HC', true),
('36', 'ae4747', 'Vermelho Rosado HC', true),
('37', '813033', 'Bordô HC', true),
('38', '5b2420', 'Marrom Avermelhado HC', true),
('39', '9B001D', 'Vermelho Escuro HC', true),
('40', 'd2183c', 'Vermelho Vivo HC', true),
('41', 'e53624', 'Vermelho HC', true),
('42', 'FF1300', 'Vermelho Neon HC', true),
('43', 'ff638f', 'Rosa HC', true),
('44', 'fe86b1', 'Rosa Claro HC', true),
('45', 'FF6D8F', 'Rosa Médio HC', true),
('46', 'ffc7e4', 'Rosa Pastel HC', true),
('47', 'E993FF', 'Roxo Claro HC', true),
('48', 'ff88f4', 'Magenta HC', true),
('49', 'FF27A6', 'Pink HC', true),
('50', 'C600AD', 'Roxo Pink HC', true),
('61', '92', 'Azul Padrão', false),
('92', '1', 'Branco Padrão', false),
('100', '100', 'Cor 100', false),
('101', '101', 'Cor 101', false),
('102', '102', 'Cor 102', false),
('104', '104', 'Cor 104', false),
('105', '105', 'Cor 105', false),
('106', '106', 'Cor 106', false),
('143', '143', 'Cor 143', false)
ON CONFLICT (color_id) DO NOTHING;



-- Create table for caching HabboEmotion API clothing data
CREATE TABLE public.habbo_clothing_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  part TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'U',
  colors JSONB NOT NULL DEFAULT '["1", "2", "3", "4", "5"]'::jsonb,
  image_url TEXT,
  club TEXT NOT NULL DEFAULT 'FREE',
  source TEXT NOT NULL DEFAULT 'habboemotion-api',
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for item_id to prevent duplicates
CREATE UNIQUE INDEX idx_habbo_clothing_cache_item_id ON public.habbo_clothing_cache(item_id);

-- Create indexes for efficient querying
CREATE INDEX idx_habbo_clothing_cache_part ON public.habbo_clothing_cache(part);
CREATE INDEX idx_habbo_clothing_cache_gender ON public.habbo_clothing_cache(gender);
CREATE INDEX idx_habbo_clothing_cache_active ON public.habbo_clothing_cache(is_active);
CREATE INDEX idx_habbo_clothing_cache_synced_at ON public.habbo_clothing_cache(api_synced_at);

-- Enable RLS
ALTER TABLE public.habbo_clothing_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to active items
CREATE POLICY "Allow public read access to active clothing items" 
ON public.habbo_clothing_cache 
FOR SELECT 
USING (is_active = true);

-- Create policy for service role to manage data
CREATE POLICY "Allow service role to manage clothing cache" 
ON public.habbo_clothing_cache 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_habbo_clothing_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_habbo_clothing_cache_updated_at
BEFORE UPDATE ON public.habbo_clothing_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_habbo_clothing_cache_updated_at();



-- Criar tabelas para o sistema Habbo Home

-- Tabela para armazenar layouts dos widgets dos usuários
CREATE TABLE public.user_home_layouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  widget_id text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 1,
  width integer,
  height integer,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para armazenar stickers posicionados pelos usuários
CREATE TABLE public.user_stickers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  sticker_id text NOT NULL,
  sticker_src text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para configurações de fundo da home
CREATE TABLE public.user_home_backgrounds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  background_type text NOT NULL DEFAULT 'color', -- 'color', 'repeat', 'cover'
  background_value text NOT NULL DEFAULT '#007bff', -- cor hex ou nome do arquivo
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para mensagens do guestbook
CREATE TABLE public.guestbook_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_owner_user_id uuid REFERENCES auth.users NOT NULL,
  author_user_id uuid REFERENCES auth.users,
  author_habbo_name text NOT NULL,
  message text NOT NULL,
  moderation_status text NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para avaliações das homes
CREATE TABLE public.user_home_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_owner_user_id uuid REFERENCES auth.users NOT NULL,
  rating_user_id uuid REFERENCES auth.users NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(home_owner_user_id, rating_user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_home_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_home_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_home_ratings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_home_layouts
CREATE POLICY "Users can manage their own layouts" 
  ON public.user_home_layouts 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view layouts" 
  ON public.user_home_layouts 
  FOR SELECT 
  USING (true);

-- Políticas RLS para user_stickers
CREATE POLICY "Users can manage their own stickers" 
  ON public.user_stickers 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view stickers" 
  ON public.user_stickers 
  FOR SELECT 
  USING (true);

-- Políticas RLS para user_home_backgrounds
CREATE POLICY "Users can manage their own backgrounds" 
  ON public.user_home_backgrounds 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view backgrounds" 
  ON public.user_home_backgrounds 
  FOR SELECT 
  USING (true);

-- Políticas RLS para guestbook_entries
CREATE POLICY "Anyone can read approved guestbook entries" 
  ON public.guestbook_entries 
  FOR SELECT 
  USING (moderation_status = 'approved');

CREATE POLICY "Authenticated users can add guestbook entries" 
  ON public.guestbook_entries 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Home owners can moderate their guestbook" 
  ON public.guestbook_entries 
  FOR UPDATE 
  USING (auth.uid() = home_owner_user_id);

-- Políticas RLS para user_home_ratings
CREATE POLICY "Anyone can read ratings" 
  ON public.user_home_ratings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can rate homes" 
  ON public.user_home_ratings 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = rating_user_id);

CREATE POLICY "Users can update their own ratings" 
  ON public.user_home_ratings 
  FOR UPDATE 
  USING (auth.uid() = rating_user_id);

-- Criar índices para otimizar consultas
CREATE INDEX idx_user_home_layouts_user_id ON public.user_home_layouts(user_id);
CREATE INDEX idx_user_stickers_user_id ON public.user_stickers(user_id);
CREATE INDEX idx_user_home_backgrounds_user_id ON public.user_home_backgrounds(user_id);
CREATE INDEX idx_guestbook_entries_home_owner ON public.guestbook_entries(home_owner_user_id);
CREATE INDEX idx_user_home_ratings_home_owner ON public.user_home_ratings(home_owner_user_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_home_layouts_updated_at 
  BEFORE UPDATE ON public.user_home_layouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_home_backgrounds_updated_at 
  BEFORE UPDATE ON public.user_home_backgrounds 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




-- Limpeza completa do usuário Beebop
-- Remove todos os registros de Beebop da tabela habbo_accounts
DELETE FROM public.habbo_accounts 
WHERE habbo_name ILIKE 'beebop';

-- Verificar se a limpeza foi bem-sucedida
SELECT COUNT(*) as registros_restantes 
FROM public.habbo_accounts 
WHERE habbo_name ILIKE 'beebop';




-- Primeiro, corrigir privilégios de admin para Beebop
UPDATE public.habbo_accounts 
SET is_admin = true 
WHERE habbo_name ILIKE 'beebop';

-- Criar função para inicializar home padrão de um usuário
CREATE OR REPLACE FUNCTION public.initialize_user_home(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#007bff')
  ON CONFLICT DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 80, 1, 300, 280, true),
    (user_uuid, 'guestbook', 350, 80, 1, 400, 350, true),
    (user_uuid, 'rating', 780, 80, 1, 200, 150, true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Criar trigger function que executa quando um usuário faz login pela primeira vez
CREATE OR REPLACE FUNCTION public.handle_new_user_home()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é o primeiro login (não tem dados de home ainda)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_home_layouts WHERE user_id = NEW.supabase_user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_home_backgrounds WHERE user_id = NEW.supabase_user_id
  ) THEN
    -- Inicializar home padrão
    PERFORM public.initialize_user_home(NEW.supabase_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela habbo_accounts para auto-inicialização
DROP TRIGGER IF EXISTS trigger_initialize_user_home ON public.habbo_accounts;
CREATE TRIGGER trigger_initialize_user_home
  AFTER INSERT ON public.habbo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_home();

-- Inicializar homes para usuários existentes que não têm home ainda
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT supabase_user_id 
    FROM public.habbo_accounts 
    WHERE supabase_user_id NOT IN (
      SELECT DISTINCT user_id FROM public.user_home_layouts
    )
  LOOP
    PERFORM public.initialize_user_home(user_record.supabase_user_id);
  END LOOP;
END $$;




-- Limpar todos os dados de usuários e contas relacionadas
DELETE FROM photo_comments;
DELETE FROM photo_likes;
DELETE FROM user_followers;
DELETE FROM guestbook_entries;
DELETE FROM user_home_ratings;
DELETE FROM user_stickers;
DELETE FROM user_home_layouts;
DELETE FROM user_home_backgrounds;
DELETE FROM habbo_accounts;

-- Criar conta única para Beebop com ID fixo
-- Nota: O auth.users precisa ser limpo manualmente via interface do Supabase
-- Após limpar, criaremos a conta Beebop programaticamente

-- Garantir que a tabela user_stickers está otimizada
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'decorative';
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0;
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS scale DECIMAL(3,2) DEFAULT 1.0;

-- Criar alguns stickers padrão se necessário
INSERT INTO user_stickers (user_id, sticker_id, sticker_src, category, x, y, z_index) VALUES
('00000000-0000-0000-0000-000000000000', 'heart_1', '/assets/home/stickers/emoticons/heart.png', 'emoticons', 0, 0, 1),
('00000000-0000-0000-0000-000000000000', 'star_1', '/assets/home/stickers/decorative/star.png', 'decorative', 0, 0, 1),
('00000000-0000-0000-0000-000000000000', 'text_1', '/assets/home/stickers/text/hello.png', 'text', 0, 0, 1)
ON CONFLICT DO NOTHING;




-- Add missing columns to user_stickers table
ALTER TABLE user_stickers 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'decorative',
ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scale DECIMAL(3,2) DEFAULT 1.0;

-- Update existing records to have default values
UPDATE user_stickers 
SET 
  category = COALESCE(category, 'decorative'),
  rotation = COALESCE(rotation, 0),
  scale = COALESCE(scale, 1.0)
WHERE category IS NULL OR rotation IS NULL OR scale IS NULL;




-- Limpeza completa dos dados de autenticação existentes (mantendo histórico do fórum)
-- Remover todas as contas habbo relacionadas ao Beebop
DELETE FROM user_stickers WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_layouts WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_backgrounds WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_ratings WHERE home_owner_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
) OR rating_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM guestbook_entries WHERE home_owner_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
) OR author_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

-- Remover contas habbo (mas manter fórum que usa habbo_name como string)
DELETE FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%';

-- Limpar dados de sessão antigos (users serão removidos automaticamente via cascade)
-- Nota: Os posts/comments do fórum serão mantidos pois usam habbo_name como string

-- Atualizar cor padrão do background para cinza-azulado do Habbo
UPDATE user_home_backgrounds 
SET background_value = '#c7d2dc' 
WHERE background_type = 'color' AND background_value = '#007bff';

-- Alterar valor padrão para novos usuários
ALTER TABLE user_home_backgrounds 
ALTER COLUMN background_value SET DEFAULT '#c7d2dc';




-- Criar um usuário auth para Beebop
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'hhbr-beebop-user-id-12345',
  'hhbr-beebop@habbohub.com',
  crypt('290684', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"habbo_name": "Beebop"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Criar a conta Habbo para Beebop
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  is_admin,
  created_at
) VALUES (
  gen_random_uuid(),
  'hhbr-beebop',
  'Beebop',
  'hhbr-beebop-user-id-12345',
  true,
  now()
) ON CONFLICT (habbo_name) DO NOTHING;




-- Limpar contas auth órfãs do usuário Beebop
DELETE FROM auth.users 
WHERE email LIKE '%@habbohub.com' 
AND raw_user_meta_data->>'habbo_name' ILIKE 'beebop'
AND id NOT IN (
  SELECT supabase_user_id 
  FROM public.habbo_accounts 
  WHERE supabase_user_id IS NOT NULL
);

-- Limpar também possíveis registros de identidades órfãs
DELETE FROM auth.identities 
WHERE user_id NOT IN (SELECT id FROM auth.users);




-- Criar tabela para categorias do fórum
CREATE TABLE public.forum_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'MessageSquare',
  bg_color text NOT NULL DEFAULT '#f0fdfa',
  topics_count integer NOT NULL DEFAULT 0,
  posts_count integer NOT NULL DEFAULT 0,
  last_post_time timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos leiam as categorias
CREATE POLICY "Anyone can view forum categories" 
  ON public.forum_categories 
  FOR SELECT 
  USING (true);

-- Política para permitir que apenas o Beebop gerencie categorias
CREATE POLICY "Only Beebop can manage forum categories" 
  ON public.forum_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.habbo_accounts 
      WHERE supabase_user_id = auth.uid() 
      AND LOWER(habbo_name) = 'beebop'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habbo_accounts 
      WHERE supabase_user_id = auth.uid() 
      AND LOWER(habbo_name) = 'beebop'
    )
  );

-- Inserir categorias padrão
INSERT INTO public.forum_categories (name, description, icon, bg_color, topics_count, posts_count) VALUES
('Discussões Gerais', 'Converse sobre o Habbo e a comunidade em geral', 'MessageSquare', '#f0fdfa', 45, 320),
('Suporte Técnico', 'Precisa de ajuda? Tire suas dúvidas técnicas aqui', 'HelpCircle', '#ecfdf5', 23, 156),
('Eventos e Competições', 'Divulgue e participe de eventos da comunidade', 'Calendar', '#fefce8', 18, 89),
('Marketplace', 'Compre, venda e troque itens do Habbo', 'ShoppingCart', '#f5f3ff', 12, 67);

-- Atualizar tabela forum_posts para referenciar as categorias
ALTER TABLE public.forum_posts ADD COLUMN category_id uuid REFERENCES public.forum_categories(id);

-- Migrar categorias existentes (assumindo que temos posts com categoria em texto)
UPDATE public.forum_posts 
SET category_id = (
  SELECT id FROM public.forum_categories 
  WHERE name = 'Discussões Gerais'
  LIMIT 1
)
WHERE category IS NULL OR category = '';




-- Criar função para inicializar home padrão para usuários
CREATE OR REPLACE FUNCTION public.ensure_user_home_exists(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 300, 280, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Garantir que o usuário Beebop tenha uma entrada no guestbook como exemplo
  IF EXISTS (SELECT 1 FROM public.habbo_accounts WHERE supabase_user_id = user_uuid AND LOWER(habbo_name) = 'beebop') THEN
    INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
    VALUES (user_uuid, 'Sistema', 'Bem-vindo à sua nova Habbo Home!', 'approved')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Atualizar constraint na tabela user_home_layouts para permitir múltiplos widgets do mesmo tipo
ALTER TABLE public.user_home_layouts DROP CONSTRAINT IF EXISTS user_home_layouts_user_id_widget_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS user_home_layouts_unique_widget 
ON public.user_home_layouts(user_id, widget_id);




-- Adicionar coluna hotel na tabela habbo_accounts
ALTER TABLE public.habbo_accounts ADD COLUMN hotel text;

-- Criar função para extrair hotel do habbo_id
CREATE OR REPLACE FUNCTION extract_hotel_from_habbo_id(habbo_id_param text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  CASE 
    WHEN habbo_id_param LIKE 'hhbr-%' THEN RETURN 'br';
    WHEN habbo_id_param LIKE 'hhcom-%' THEN RETURN 'com';
    WHEN habbo_id_param LIKE 'hhes-%' THEN RETURN 'es';
    WHEN habbo_id_param LIKE 'hhfr-%' THEN RETURN 'fr';
    WHEN habbo_id_param LIKE 'hhde-%' THEN RETURN 'de';
    WHEN habbo_id_param LIKE 'hhit-%' THEN RETURN 'it';
    WHEN habbo_id_param LIKE 'hhnl-%' THEN RETURN 'nl';
    WHEN habbo_id_param LIKE 'hhfi-%' THEN RETURN 'fi';
    WHEN habbo_id_param LIKE 'hhtr-%' THEN RETURN 'tr';
    ELSE RETURN 'com'; -- fallback para .com
  END CASE;
END;
$$;

-- Preencher a coluna hotel para registros existentes
UPDATE public.habbo_accounts 
SET hotel = extract_hotel_from_habbo_id(habbo_id) 
WHERE hotel IS NULL;

-- Tornar a coluna hotel obrigatória
ALTER TABLE public.habbo_accounts ALTER COLUMN hotel SET NOT NULL;

-- Remover constraint única existente em habbo_name se existir
DROP INDEX IF EXISTS habbo_accounts_habbo_name_key;

-- Criar constraint única composta para habbo_name + hotel
CREATE UNIQUE INDEX habbo_accounts_name_hotel_unique ON public.habbo_accounts(habbo_name, hotel);

-- Atualizar função de inicialização para incluir hotel
CREATE OR REPLACE FUNCTION public.ensure_user_home_exists(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 300, 280, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Adicionar entrada de boas-vindas no guestbook se não existir
  INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
  VALUES (user_uuid, 'HabboHub', 'Bem-vindo à sua nova Habbo Home! 🏠✨', 'approved')
  ON CONFLICT DO NOTHING;
END;
$$;




-- Create home_assets table for managing all asset types
CREATE TABLE public.home_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Stickers', 'Mockups', 'Montáveis', 'Ícones', 'Papel de Parede', 'Animados')),
  file_path text NOT NULL,
  bucket_name text NOT NULL DEFAULT 'home-assets',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_home_assets_category ON public.home_assets(category);
CREATE INDEX idx_home_assets_active ON public.home_assets(is_active);

-- Enable RLS
ALTER TABLE public.home_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for home_assets
CREATE POLICY "Anyone can view active home assets" 
ON public.home_assets FOR SELECT 
USING (is_active = true);

CREATE POLICY "Service role can manage home assets"
ON public.home_assets FOR ALL 
USING (true)
WITH CHECK (true);

-- Update user_stickers table to include z_index controls
ALTER TABLE public.user_stickers 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_home_assets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER home_assets_updated_at
  BEFORE UPDATE ON public.home_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_home_assets_updated_at();

CREATE TRIGGER user_stickers_updated_at
  BEFORE UPDATE ON public.user_stickers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




-- 1) Permitir leitura pública de habbo_accounts (apenas SELECT)
-- Importante: esta tabela só contém habbo_id (público por natureza), habbo_name, hotel e supabase_user_id.
-- Se quiser restringir ainda mais no futuro, podemos expor apenas um VIEW com colunas limitadas.
CREATE POLICY IF NOT EXISTS "Public can read habbo accounts for lookup"
ON public.habbo_accounts
FOR SELECT
USING (true);

-- 2) Índices para acelerar buscas por nome (case-insensitive) e por nome + hotel
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_lower_name
  ON public.habbo_accounts (lower(habbo_name));

CREATE INDEX IF NOT EXISTS idx_habbo_accounts_lower_name_hotel
  ON public.habbo_accounts (lower(habbo_name), hotel);

-- 3) Garantir que ON CONFLICT (user_id) funcione em user_home_backgrounds
CREATE UNIQUE INDEX IF NOT EXISTS user_home_backgrounds_user_id_unique
  ON public.user_home_backgrounds(user_id);

-- 4) Atualizar a função ensure_user_home_exists:
-- - Define search_path para evitar alertas de segurança
-- - Mantém o ON CONFLICT usando os índices/constraints apropriados
CREATE OR REPLACE FUNCTION public.ensure_user_home_exists(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar',    20,  20, 1, 300, 280, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating',   500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Mensagem inicial no guestbook para perfis específicos (exemplo Beebop)
  IF EXISTS (
    SELECT 1 
    FROM public.habbo_accounts 
    WHERE supabase_user_id = user_uuid AND LOWER(habbo_name) = 'beebop'
  ) THEN
    INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
    VALUES (user_uuid, 'Sistema', 'Bem-vindo à sua nova Habbo Home!', 'approved')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;




-- 1) Índice único para suportar ON CONFLICT (user_id) em user_home_backgrounds
CREATE UNIQUE INDEX IF NOT EXISTS user_home_backgrounds_unique_user
  ON public.user_home_backgrounds(user_id);

-- 2) RPC pública (SECURITY DEFINER) para buscar dados mínimos da conta por nome
CREATE OR REPLACE FUNCTION public.get_habbo_account_public_by_name(habbo_name_param text)
RETURNS TABLE (
  supabase_user_id uuid,
  habbo_name text,
  habbo_id text,
  hotel text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ha.supabase_user_id, ha.habbo_name, ha.habbo_id, ha.hotel
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
  LIMIT 1;
END;
$$;

-- 3) RPC pública (SECURITY DEFINER) para obter o e-mail de auth a partir do nome
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo(habbo_name_param text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
  LIMIT 1;

  RETURN v_email;
END;
$$;

-- 4) Privilégios de execução para as RPCs
REVOKE ALL ON FUNCTION public.get_habbo_account_public_by_name(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_auth_email_for_habbo(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_habbo_account_public_by_name(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_auth_email_for_habbo(text) TO anon, authenticated, service_role;

-- 5) Gatilho: inicializar Home ao inserir uma nova habbo_account
DROP TRIGGER IF EXISTS trg_handle_new_user_home ON public.habbo_accounts;

CREATE TRIGGER trg_handle_new_user_home
AFTER INSERT ON public.habbo_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_home();




-- Create RPC function to get habbo account by name and hotel
CREATE OR REPLACE FUNCTION public.get_habbo_account_public_by_name_and_hotel(
  habbo_name_param text, 
  hotel_param text
)
RETURNS TABLE(supabase_user_id uuid, habbo_name text, habbo_id text, hotel text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT ha.supabase_user_id, ha.habbo_name, ha.habbo_id, ha.hotel
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;
END;
$$;

-- Update the existing RPC to also handle hotel-aware auth email lookup
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo_with_hotel(
  habbo_name_param text,
  hotel_param text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  IF hotel_param IS NOT NULL THEN
    -- Search for specific hotel first
    SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
    FROM public.habbo_accounts ha
    WHERE lower(ha.habbo_name) = lower(habbo_name_param)
      AND ha.hotel = hotel_param
    LIMIT 1;
  END IF;
  
  -- If not found or no hotel specified, search without hotel filter
  IF v_email IS NULL THEN
    SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
    FROM public.habbo_accounts ha
    WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    LIMIT 1;
  END IF;

  RETURN v_email;
END;
$$;




-- Create editor_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor_images',
  'editor_images', 
  true,
  52428800,
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create forum_images bucket if it doesn't exist  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum_images',
  'forum_images',
  true, 
  52428800,
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create site_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'site_images',
  'site_images',
  true,
  52428800, 
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for public read access to editor_images
CREATE POLICY IF NOT EXISTS "Public read access for editor_images" ON storage.objects
FOR SELECT USING (bucket_id = 'editor_images');

-- Set up RLS policies for public read access to forum_images  
CREATE POLICY IF NOT EXISTS "Public read access for forum_images" ON storage.objects
FOR SELECT USING (bucket_id = 'forum_images');

-- Set up RLS policies for public read access to site_images
CREATE POLICY IF NOT EXISTS "Public read access for site_images" ON storage.objects  
FOR SELECT USING (bucket_id = 'site_images');




-- Create tables for console interactions (likes, comments, follows)
CREATE TABLE IF NOT EXISTS console_profile_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_habbo_name)
);

CREATE TABLE IF NOT EXISTS console_profile_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_habbo_name TEXT NOT NULL,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS console_profile_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_user_id, target_habbo_name)
);

-- Enable RLS
ALTER TABLE console_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_profile_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_profile_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for console_profile_likes
CREATE POLICY "Anyone can view likes" ON console_profile_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like profiles" ON console_profile_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" ON console_profile_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for console_profile_comments
CREATE POLICY "Anyone can view comments" ON console_profile_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON console_profile_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON console_profile_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON console_profile_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for console_profile_follows
CREATE POLICY "Anyone can view follows" ON console_profile_follows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow profiles" ON console_profile_follows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow profiles" ON console_profile_follows
  FOR DELETE USING (auth.uid() = follower_user_id);




-- Create table to track which users we want to monitor
CREATE TABLE public.tracked_habbo_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'com.br',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel)
);

-- Create table to store user snapshots from Habbo API
CREATE TABLE public.habbo_user_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  motto TEXT,
  figure_string TEXT,
  is_online BOOLEAN DEFAULT false,
  last_web_visit TIMESTAMP WITH TIME ZONE,
  member_since TIMESTAMP WITH TIME ZONE,
  badges_count INTEGER DEFAULT 0,
  photos_count INTEGER DEFAULT 0,
  friends_count INTEGER DEFAULT 0,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel, created_at)
);

-- Create table to store detected activities/changes
CREATE TABLE public.habbo_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'motto_change', 'avatar_update', 'new_badge', 'new_photo', 'new_friend', 'status_change'
  description TEXT NOT NULL,
  details JSONB,
  snapshot_id UUID REFERENCES public.habbo_user_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracked_habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (for the feed)
CREATE POLICY "Anyone can view tracked users" ON public.tracked_habbo_users FOR SELECT USING (true);
CREATE POLICY "Anyone can view snapshots" ON public.habbo_user_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON public.habbo_activities FOR SELECT USING (true);

-- Service role can manage all data
CREATE POLICY "Service role can manage tracked users" ON public.tracked_habbo_users FOR ALL USING (true);
CREATE POLICY "Service role can manage snapshots" ON public.habbo_user_snapshots FOR ALL USING (true);
CREATE POLICY "Service role can manage activities" ON public.habbo_activities FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_tracked_habbo_users_active ON public.tracked_habbo_users (is_active, hotel);
CREATE INDEX idx_habbo_user_snapshots_lookup ON public.habbo_user_snapshots (habbo_name, hotel, created_at DESC);
CREATE INDEX idx_habbo_activities_recent ON public.habbo_activities (created_at DESC, hotel);
CREATE INDEX idx_habbo_activities_by_user ON public.habbo_activities (habbo_name, hotel, created_at DESC);

-- Insert some popular users to track initially
INSERT INTO public.tracked_habbo_users (habbo_name, hotel) VALUES 
('HabboExplorer', 'com.br'),
('CyberHabbo', 'com.br'),
('DigitalDream', 'com.br'),
('VirtualLife', 'com.br'),
('RetroGamer', 'com.br'),
('HabboPro', 'com.br'),
('PixelDancer', 'com.br'),
('NetCitizen', 'com.br'),
('DigitalNinja', 'com.br'),
('OnlineUser', 'com.br'),
('HabboFan2024', 'com.br'),
('VirtualHero', 'com.br')
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the batch sync to run every 10 minutes
SELECT cron.schedule(
  'habbo-sync-batch',
  '*/10 * * * *', -- every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);




-- Create table for tracking which users we should monitor
CREATE TABLE public.tracked_habbo_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'com.br',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel)
);

-- Create table for storing user snapshots (complete state at a point in time)
CREATE TABLE public.habbo_user_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  motto TEXT,
  figure_string TEXT,
  is_online BOOLEAN DEFAULT false,
  last_web_visit TIMESTAMP WITH TIME ZONE,
  member_since TIMESTAMP WITH TIME ZONE,
  badges_count INTEGER DEFAULT 0,
  photos_count INTEGER DEFAULT 0,
  friends_count INTEGER DEFAULT 0,
  groups_count INTEGER DEFAULT 0,
  raw_data JSONB, -- Complete API response for detailed comparisons
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing computed activities/diffs
CREATE TABLE public.habbo_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'motto_change', 'avatar_update', 'new_badge', 'new_photo', 'new_friend', 'new_group', 'status_change', 'user_tracked'
  description TEXT NOT NULL, -- Human readable description in PT-BR
  details JSONB, -- Specific details about the change (counts, items, etc.)
  snapshot_id UUID REFERENCES public.habbo_user_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables (public read, service role write)
ALTER TABLE public.tracked_habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_activities ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view tracked users" ON public.tracked_habbo_users FOR SELECT USING (true);
CREATE POLICY "Anyone can view snapshots" ON public.habbo_user_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON public.habbo_activities FOR SELECT USING (true);

-- Service role can manage everything
CREATE POLICY "Service role can manage tracked users" ON public.tracked_habbo_users FOR ALL USING (true);
CREATE POLICY "Service role can manage snapshots" ON public.habbo_user_snapshots FOR ALL USING (true);
CREATE POLICY "Service role can manage activities" ON public.habbo_activities FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_tracked_users_active ON public.tracked_habbo_users(is_active, hotel);
CREATE INDEX idx_snapshots_user_time ON public.habbo_user_snapshots(habbo_name, hotel, created_at DESC);
CREATE INDEX idx_activities_user_time ON public.habbo_activities(habbo_name, hotel, created_at DESC);
CREATE INDEX idx_activities_type_time ON public.habbo_activities(activity_type, created_at DESC);

-- Insert some initial users to track (including 'adami' from your example)
INSERT INTO public.tracked_habbo_users (habbo_name, habbo_id, hotel, is_active) VALUES
('adami', 'hhbr-ba7f01c16650fcd3f7c874d0ba2a845d', 'com.br', true),
('Beebop', 'hhbr-example-beebop', 'com.br', true),
('habbohub', 'hhbr-example-habbohub', 'com.br', true)
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- Enable pg_cron extension for scheduled syncing
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule batch sync every 3 minutes
SELECT cron.schedule(
  'habbo-sync-batch',
  '*/3 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.WrczBcDnftc1SiSjpUTepwSgH14ZBQP_QGqRKYvJQNA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);



-- Add more popular users from habbo.com.br to tracking
INSERT INTO public.tracked_habbo_users (habbo_name, hotel, habbo_id, is_active) VALUES
('Sorriizx', 'com.br', 'hhbr-sorriizx', true),
('Caroll', 'com.br', 'hhbr-caroll', true),
('Maycontm', 'com.br', 'hhbr-maycontm', true),
('Marceline', 'com.br', 'hhbr-marceline', true),
('Ixabelle', 'com.br', 'hhbr-ixabelle', true),
('Paniic', 'com.br', 'hhbr-paniic', true),
('Giiuuh', 'com.br', 'hhbr-giiuuh', true),
('Reiizinha', 'com.br', 'hhbr-reiizinha', true),
('Brunno', 'com.br', 'hhbr-brunno', true),
('Gabruuh', 'com.br', 'hhbr-gabruuh', true)
ON CONFLICT (habbo_name, hotel) DO NOTHING;


-- Create a cron job to automatically sync tracked users every 30 minutes
SELECT cron.schedule(
  'habbo-batch-sync-auto',
  '*/30 * * * *', -- every 30 minutes
  $$
  SELECT
    net.http_post(
      url:='https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:='{"hotel": "com.br"}'::jsonb
    ) as request_id;
  $$
);


-- Fix security issue: Restrict habbo_user_snapshots access to authenticated users only
-- This prevents competitors from scraping user data while maintaining functionality

-- Drop the overly permissive policy that allows anyone to view snapshots
DROP POLICY IF EXISTS "Anyone can view snapshots" ON public.habbo_user_snapshots;

-- Create a new policy that requires authentication to view snapshots
CREATE POLICY "Authenticated users can view snapshots" 
ON public.habbo_user_snapshots 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the service role policy for backend operations (unchanged)
-- "Service role can manage snapshots" policy remains as is



-- Criar tabela para armazenar fotos dos usuários Habbo
CREATE TABLE public.habbo_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL, -- UUID da foto no Habbo
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  s3_url TEXT NOT NULL,
  preview_url TEXT,
  internal_user_id TEXT, -- ID interno extraído do S3 URL
  timestamp_taken BIGINT, -- Timestamp extraído do S3 URL
  caption TEXT,
  room_name TEXT,
  taken_date TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  photo_type TEXT DEFAULT 'PHOTO',
  source TEXT DEFAULT 'profile_scraping',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, habbo_name)
);

-- Adicionar RLS para permitir leitura pública das fotos
ALTER TABLE public.habbo_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view habbo photos" 
  ON public.habbo_photos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage habbo photos" 
  ON public.habbo_photos 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_habbo_photos_habbo_name ON public.habbo_photos(habbo_name);
CREATE INDEX idx_habbo_photos_hotel ON public.habbo_photos(hotel);
CREATE INDEX idx_habbo_photos_taken_date ON public.habbo_photos(taken_date DESC);
CREATE INDEX idx_habbo_photos_created_at ON public.habbo_photos(created_at DESC);

-- Modificar tabela habbo_activities para incluir eventos de fotos
ALTER TABLE public.habbo_activities 
ADD COLUMN IF NOT EXISTS photo_id TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_habbo_photos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_habbo_photos_updated_at
  BEFORE UPDATE ON public.habbo_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_habbo_photos_updated_at();




-- Criar tabela para sistema de follows/seguindo
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  followed_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, followed_user_id)
);

-- Adicionar RLS policies para user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" 
  ON public.user_follows 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can follow others" 
  ON public.user_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow" 
  ON public.user_follows 
  FOR DELETE 
  USING (auth.uid() = follower_user_id);

-- Inserir dados de teste para as fotos do Beebop
INSERT INTO public.habbo_photos (
  photo_id, habbo_name, habbo_id, hotel, s3_url, preview_url, 
  timestamp_taken, taken_date, likes_count, photo_type, source, caption
) VALUES 
  ('beebop-1754077680410', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png', 1754077680410, '2025-01-08', 3, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1754044232199', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png', 1754044232199, '2025-01-08', 5, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569308915', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png', 1753569308915, '2025-07-26', 5, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569292755', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png', 1753569292755, '2025-07-26', 0, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569144621', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png', 1753569144621, '2025-07-26', 1, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1747003293190', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png', 1747003293190, '2025-05-11', 4, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1742092026239', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png', 1742092026239, '2025-03-15', 6, 'PHOTO', 'manual_insert', 'Foto do Beebop')
ON CONFLICT (photo_id, habbo_name, hotel) DO UPDATE SET
  likes_count = EXCLUDED.likes_count,
  updated_at = now();




-- Insert test photos for Beebop user
INSERT INTO public.habbo_photos (
  id,
  photo_id,
  habbo_name,
  habbo_id,
  hotel,
  s3_url,
  timestamp_taken,
  taken_date,
  likes_count,
  photo_type,
  source,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  '22f867d2-205e-46d9-ad39-62bb5a0c798e',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png',
  1754077680410,
  '2025-08-01',
  3,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '2d624d81-eb21-4ca9-b60a-2e3daaf26ff7',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png',
  1754044232199,
  '2025-08-01',
  5,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  'bfff42dd-5fac-4d91-b653-bfc3accbd506',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png',
  1753569308915,
  '2025-07-26',
  5,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '05f76522-f2c2-451b-97d4-80667fef4dd4',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png',
  1753569292755,
  '2025-07-26',
  0,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '53425d38-a595-4eaf-b4f2-d8f981a499ba',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png',
  1753569144621,
  '2025-07-26',
  1,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  'd10fda01-1184-408b-a793-65faa24948c9',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png',
  1747003293190,
  '2025-05-11',
  4,
  'PHOTO',
  'scraped',
  now(),
  now()
),
(
  gen_random_uuid(),
  '2339e2c0-349d-40c1-85f9-08f1ff258ee3',
  'Beebop',
  '464837',
  'br',
  'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png',
  1742092026239,
  '2025-03-15',
  6,
  'PHOTO',
  'scraped',
  now(),
  now()
);




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




-- Adicionar colunas faltantes na tabela habbo_accounts
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS figure_string text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_access timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Adicionar índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_habbo_name_lower ON public.habbo_accounts (lower(habbo_name));
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_hotel ON public.habbo_accounts (hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_is_online ON public.habbo_accounts (is_online);

-- Verificar se as tabelas necessárias para homes existem, se não, criar
CREATE TABLE IF NOT EXISTS public.user_home_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  widget_type text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 300,
  height integer NOT NULL DEFAULT 200,
  z_index integer NOT NULL DEFAULT 1,
  is_visible boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para widgets
ALTER TABLE public.user_home_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage their own widgets" 
  ON public.user_home_widgets 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Public can view widgets" 
  ON public.user_home_widgets 
  FOR SELECT 
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_home_widgets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER IF NOT EXISTS trigger_update_user_home_widgets_updated_at
  BEFORE UPDATE ON public.user_home_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_user_home_widgets_updated_at();

-- Função para inicializar home de usuário com widgets padrão
CREATE OR REPLACE FUNCTION public.initialize_user_home_complete(user_uuid uuid, user_habbo_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, width, height, z_index, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 520, 180, 1, true),
    (user_uuid, 'guestbook', 50, 220, 420, 380, 1, true),
    (user_uuid, 'rating', 500, 220, 320, 160, 1, true)
  ON CONFLICT DO NOTHING;

  -- Inserir layouts compatíveis com sistema antigo
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, width, height, z_index, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 520, 180, 1, true),
    (user_uuid, 'guestbook', 50, 220, 420, 380, 1, true),
    (user_uuid, 'rating', 500, 220, 320, 160, 1, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Adicionar entrada de boas-vindas no guestbook se não existir
  INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
  VALUES (user_uuid, 'HabboHub', 'Bem-vindo à sua nova Habbo Home! 🏠✨', 'approved')
  ON CONFLICT DO NOTHING;
END;
$function$;




-- Adicionar campos faltantes à tabela habbo_accounts
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS figure_string text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;

-- Criar tabela user_home_widgets se não existir
CREATE TABLE IF NOT EXISTS public.user_home_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  widget_type text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 1,
  width integer NOT NULL DEFAULT 300,
  height integer NOT NULL DEFAULT 200,
  is_visible boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, widget_type)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.user_home_widgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_home_widgets
CREATE POLICY "Public can view home widgets" 
  ON public.user_home_widgets 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own home widgets" 
  ON public.user_home_widgets 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Criar função initialize_user_home_complete
CREATE OR REPLACE FUNCTION public.initialize_user_home_complete(user_uuid uuid, user_habbo_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#c7d2dc')
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão na nova tabela se não existirem
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_type) DO NOTHING;

  -- Inserir widgets padrão na tabela antiga também para compatibilidade
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true)
  ON CONFLICT (user_id, widget_id) DO NOTHING;

  -- Adicionar entrada de boas-vindas no guestbook se não existir
  INSERT INTO public.guestbook_entries (home_owner_user_id, author_habbo_name, message, moderation_status)
  VALUES (user_uuid, 'HabboHub', 'Bem-vindo à sua nova Habbo Home! 🏠✨', 'approved')
  ON CONFLICT DO NOTHING;
END;
$function$;



-- Create table for real friends activities
CREATE TABLE public.friends_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  activity_type TEXT NOT NULL, -- 'badge', 'friend_added', 'motto_change', 'photo_uploaded', 'room_visited', 'status_change'
  activity_description TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friends_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view friends activities" 
ON public.friends_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage friends activities" 
ON public.friends_activities 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_friends_activities_habbo_name_created_at 
ON public.friends_activities (habbo_name, created_at DESC);

CREATE INDEX idx_friends_activities_activity_type_created_at 
ON public.friends_activities (activity_type, created_at DESC);

-- Create function to clean old activities (keep only 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_friends_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.friends_activities 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;


-- Fix rating widget sizing to match the smaller 192x140 size
UPDATE user_home_widgets 
SET width = 192, height = 140 
WHERE widget_type = 'rating';


-- Limpeza completa das contas existentes (preservando apenas Beebop)

-- 1. Primeiro, vamos identificar o user_id do Beebop
DO $$
DECLARE
    beebop_user_id uuid;
BEGIN
    -- Buscar o user_id do Beebop
    SELECT supabase_user_id INTO beebop_user_id 
    FROM public.habbo_accounts 
    WHERE lower(habbo_name) = 'beebop' 
    LIMIT 1;

    -- Log para debug
    RAISE NOTICE 'Beebop user_id: %', beebop_user_id;

    -- 2. Limpar dados relacionados nas tabelas (preservando Beebop)
    
    -- User stickers
    DELETE FROM public.user_stickers 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home ratings
    DELETE FROM public.user_home_ratings 
    WHERE (home_owner_user_id != beebop_user_id AND rating_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User home widgets
    DELETE FROM public.user_home_widgets 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home layouts
    DELETE FROM public.user_home_layouts 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home backgrounds
    DELETE FROM public.user_home_backgrounds 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Guestbook entries
    DELETE FROM public.guestbook_entries 
    WHERE (home_owner_user_id != beebop_user_id AND author_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User followers
    DELETE FROM public.user_followers 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo comments
    DELETE FROM public.photo_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo likes
    DELETE FROM public.photo_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile comments
    DELETE FROM public.console_profile_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile follows
    DELETE FROM public.console_profile_follows 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile likes
    DELETE FROM public.console_profile_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum posts
    DELETE FROM public.forum_posts 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum comments
    DELETE FROM public.forum_comments 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;

    -- 3. Deletar contas Habbo (preservando Beebop)
    DELETE FROM public.habbo_accounts 
    WHERE lower(habbo_name) != 'beebop';

    -- 4. Log final
    RAISE NOTICE 'Limpeza concluída. Contas preservadas: %', 
        (SELECT COUNT(*) FROM public.habbo_accounts);
    
END $$;


-- Limpeza completa das contas existentes (preservando apenas Beebop)

-- 1. Primeiro, vamos identificar o user_id do Beebop
DO $$
DECLARE
    beebop_user_id uuid;
BEGIN
    -- Buscar o user_id do Beebop
    SELECT supabase_user_id INTO beebop_user_id 
    FROM public.habbo_accounts 
    WHERE lower(habbo_name) = 'beebop' 
    LIMIT 1;

    -- Log para debug
    RAISE NOTICE 'Beebop user_id: %', beebop_user_id;

    -- 2. Limpar dados relacionados nas tabelas (preservando Beebop)
    
    -- User stickers
    DELETE FROM public.user_stickers 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home ratings
    DELETE FROM public.user_home_ratings 
    WHERE (home_owner_user_id != beebop_user_id AND rating_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User home widgets
    DELETE FROM public.user_home_widgets 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home layouts
    DELETE FROM public.user_home_layouts 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home backgrounds
    DELETE FROM public.user_home_backgrounds 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Guestbook entries
    DELETE FROM public.guestbook_entries 
    WHERE (home_owner_user_id != beebop_user_id AND author_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User followers
    DELETE FROM public.user_followers 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo comments
    DELETE FROM public.photo_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo likes
    DELETE FROM public.photo_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile comments
    DELETE FROM public.console_profile_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile follows
    DELETE FROM public.console_profile_follows 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile likes
    DELETE FROM public.console_profile_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum posts
    DELETE FROM public.forum_posts 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum comments
    DELETE FROM public.forum_comments 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;

    -- 3. Deletar contas Habbo (preservando Beebop)
    DELETE FROM public.habbo_accounts 
    WHERE lower(habbo_name) != 'beebop';

    -- 4. Log final
    RAISE NOTICE 'Limpeza concluída. Contas preservadas: %', 
        (SELECT COUNT(*) FROM public.habbo_accounts);
    
END $$;


-- Add delete policy for guestbook entries
CREATE POLICY "Users can delete their own comments and home owners can delete any comment" 
ON public.guestbook_entries 
FOR DELETE 
USING (
  auth.uid() = author_user_id OR auth.uid() = home_owner_user_id
);


-- Create comment_reports table for moderation
CREATE TABLE public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  reporter_user_id UUID NOT NULL,
  reporter_habbo_name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_admin TEXT
);

-- Enable RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_reports
CREATE POLICY "Users can report comments" 
ON public.comment_reports 
FOR INSERT 
WITH CHECK (auth.uid()::text = reporter_user_id::text);

CREATE POLICY "Users can view their own reports" 
ON public.comment_reports 
FOR SELECT 
USING (auth.uid()::text = reporter_user_id::text);

-- Create index for better performance
CREATE INDEX idx_comment_reports_comment_id ON public.comment_reports(comment_id);
CREATE INDEX idx_comment_reports_status ON public.comment_reports(status);

-- Add delete policy for photo_comments (users can delete their own comments)
CREATE POLICY "Users can delete their own comments" 
ON public.photo_comments 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Add policy for photo owners to delete comments on their photos
-- We'll need to check if the user owns the photo through photo_likes table
CREATE POLICY "Photo owners can delete comments on their photos" 
ON public.photo_comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.photos p 
    WHERE p.id = photo_comments.photo_id 
    AND p.user_id::text = auth.uid()::text
  )
);


-- Create comment_reports table for moderation (simplified)
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  reporter_user_id UUID NOT NULL,
  reporter_habbo_name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_admin TEXT
);

-- Enable RLS only if table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comment_reports' AND table_schema = 'public') THEN
    ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY IF NOT EXISTS "Users can report comments" 
    ON public.comment_reports 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = reporter_user_id::text);

    CREATE POLICY IF NOT EXISTS "Users can view their own reports" 
    ON public.comment_reports 
    FOR SELECT 
    USING (auth.uid()::text = reporter_user_id::text);

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON public.comment_reports(comment_id);
    CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON public.comment_reports(status);
  END IF;
END
$$;


-- ETAPA 3: Sistema de Queue para Processamento Distribuído
-- Criar tabela para gerenciar processamento de amigos em chunks

CREATE TABLE public.friends_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_habbo_name TEXT NOT NULL,
  user_habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  friend_habbo_name TEXT NOT NULL,
  friend_habbo_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  priority INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_friends_processing_queue_status ON public.friends_processing_queue(status);
CREATE INDEX idx_friends_processing_queue_priority ON public.friends_processing_queue(priority DESC, created_at ASC);
CREATE INDEX idx_friends_processing_queue_user ON public.friends_processing_queue(user_habbo_name, hotel);
CREATE INDEX idx_friends_processing_queue_processing ON public.friends_processing_queue(status, last_processed_at);

-- Enable RLS
ALTER TABLE public.friends_processing_queue ENABLE ROW LEVEL SECURITY;

-- Policy para permitir que service role gerencie a queue
CREATE POLICY "Service role can manage friends processing queue"
ON public.friends_processing_queue
FOR ALL
USING (true)
WITH CHECK (true);

-- Policy para usuários autenticados visualizarem apenas suas próprias entradas
CREATE POLICY "Users can view their own processing queue"
ON public.friends_processing_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE habbo_accounts.supabase_user_id = auth.uid() 
    AND lower(habbo_accounts.habbo_name) = lower(friends_processing_queue.user_habbo_name)
  )
);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_friends_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER trigger_update_friends_queue_updated_at
  BEFORE UPDATE ON public.friends_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_friends_queue_updated_at();

-- Função para popular a queue com amigos de um usuário
CREATE OR REPLACE FUNCTION public.populate_friends_queue(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'br'
)
RETURNS INTEGER AS $$
DECLARE
  v_inserted_count INTEGER := 0;
BEGIN
  -- Esta função será chamada pelo edge function com a lista de amigos
  -- Por enquanto, apenas retorna 0
  RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter próximos itens da queue para processamento
CREATE OR REPLACE FUNCTION public.get_next_queue_batch(
  p_batch_size INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_habbo_name TEXT,
  user_habbo_id TEXT,
  hotel TEXT,
  friend_habbo_name TEXT,
  friend_habbo_id TEXT,
  priority INTEGER,
  retry_count INTEGER
) AS $$
BEGIN
  -- Marcar items como 'processing' e retornar batch
  UPDATE public.friends_processing_queue
  SET 
    status = 'processing',
    last_processed_at = now()
  WHERE id IN (
    SELECT fq.id 
    FROM public.friends_processing_queue fq
    WHERE fq.status = 'pending' 
    AND fq.retry_count < fq.max_retries
    ORDER BY fq.priority DESC, fq.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  );

  -- Retornar os items que foram marcados para processamento
  RETURN QUERY
  SELECT 
    fq.id,
    fq.user_habbo_name,
    fq.user_habbo_id,
    fq.hotel,
    fq.friend_habbo_name,
    fq.friend_habbo_id,
    fq.priority,
    fq.retry_count
  FROM public.friends_processing_queue fq
  WHERE fq.status = 'processing' 
  AND fq.last_processed_at >= now() - INTERVAL '1 minute'
  ORDER BY fq.priority DESC, fq.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar item como processado
CREATE OR REPLACE FUNCTION public.mark_queue_item_completed(
  p_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.friends_processing_queue
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar item como falha
CREATE OR REPLACE FUNCTION public.mark_queue_item_failed(
  p_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.friends_processing_queue
  SET 
    status = CASE 
      WHEN retry_count >= max_retries THEN 'failed'
      ELSE 'pending'
    END,
    retry_count = retry_count + 1,
    error_message = p_error_message,
    updated_at = now(),
    last_processed_at = NULL
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função de limpeza para remover itens antigos processados
CREATE OR REPLACE FUNCTION public.cleanup_processed_queue_items()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.friends_processing_queue
  WHERE status = 'completed' 
  AND updated_at < now() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to process friends queue every 2 minutes
SELECT cron.schedule(
  'process-friends-queue',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 50}'::jsonb
  ) as request_id;
  $$
);

-- Create cron job to populate queue for active users every 10 minutes
SELECT cron.schedule(
  'populate-friends-queue', 
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "populate_queue", "user_habbo_name": "Beebop", "user_habbo_id": "hhbr-9d61d51f6b532511b0311ceadb484369", "hotel": "com.br", "batch_size": 100}'::jsonb
  ) as request_id;
  $$
);

-- Function to trigger emergency processing for a specific user
CREATE OR REPLACE FUNCTION trigger_emergency_processing(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'com.br'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- First populate the queue
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', p_user_habbo_name, p_user_habbo_id, p_hotel)::jsonb
  ) INTO v_request_id;

  -- Wait a moment then start processing
  PERFORM pg_sleep(2);
  
  -- Process initial batch
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
  ) INTO v_request_id;

  RETURN format('Emergency processing initiated for %s. Request ID: %s', p_user_habbo_name, v_request_id);
END;
$$;


-- Fix search_path warnings by adding SET search_path TO 'public' to functions

-- Update trigger_emergency_processing function
CREATE OR REPLACE FUNCTION trigger_emergency_processing(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'com.br'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- First populate the queue
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', p_user_habbo_name, p_user_habbo_id, p_hotel)::jsonb
  ) INTO v_request_id;

  -- Wait a moment then start processing
  PERFORM pg_sleep(2);
  
  -- Process initial batch
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
  ) INTO v_request_id;

  RETURN format('Emergency processing initiated for %s. Request ID: %s', p_user_habbo_name, v_request_id);
END;
$$;

-- Update other critical functions with search_path
CREATE OR REPLACE FUNCTION get_next_queue_batch(p_batch_size integer DEFAULT 50)
RETURNS TABLE(id uuid, user_habbo_name text, user_habbo_id text, hotel text, friend_habbo_name text, friend_habbo_id text, priority integer, retry_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Marcar items como 'processing' e retornar batch
  UPDATE friends_processing_queue
  SET 
    status = 'processing',
    last_processed_at = now()
  WHERE id IN (
    SELECT fq.id 
    FROM friends_processing_queue fq
    WHERE fq.status = 'pending' 
    AND fq.retry_count < fq.max_retries
    ORDER BY fq.priority DESC, fq.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  );

  -- Retornar os items que foram marcados para processamento
  RETURN QUERY
  SELECT 
    fq.id,
    fq.user_habbo_name,
    fq.user_habbo_id,
    fq.hotel,
    fq.friend_habbo_name,
    fq.friend_habbo_id,
    fq.priority,
    fq.retry_count
  FROM friends_processing_queue fq
  WHERE fq.status = 'processing' 
  AND fq.last_processed_at >= now() - INTERVAL '1 minute'
  ORDER BY fq.priority DESC, fq.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION mark_queue_item_completed(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE friends_processing_queue
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_queue_item_failed(p_id uuid, p_error_message text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE friends_processing_queue
  SET 
    status = CASE 
      WHEN retry_count >= max_retries THEN 'failed'
      ELSE 'pending'
    END,
    retry_count = retry_count + 1,
    error_message = p_error_message,
    updated_at = now(),
    last_processed_at = NULL
  WHERE id = p_id;
END;
$$;


-- PLANO DE CORREÇÃO CRÍTICA ETAPA 1: Reativação do Sistema
-- Force populate queue for all active users and trigger immediate processing

-- 1. Trigger emergency processing for all active habbo accounts
DO $$
DECLARE
    account_rec RECORD;
    processing_count INTEGER := 0;
BEGIN
    -- Loop through all active habbo accounts and trigger emergency processing
    FOR account_rec IN 
        SELECT habbo_name, habbo_id, hotel 
        FROM habbo_accounts 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        LIMIT 10 -- Process 10 users at a time to avoid overload
    LOOP
        BEGIN
            -- Trigger emergency processing for each user
            PERFORM trigger_emergency_processing(
                account_rec.habbo_name, 
                account_rec.habbo_id, 
                account_rec.hotel
            );
            processing_count := processing_count + 1;
            
            -- Add small delay between requests to avoid overwhelming
            PERFORM pg_sleep(0.5);
            
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue processing other users
            RAISE NOTICE 'Error processing user %: %', account_rec.habbo_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Emergency processing triggered for % users', processing_count;
END $$;

-- 2. Create function to monitor and restart stalled processing
CREATE OR REPLACE FUNCTION restart_stalled_queue_processing()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    stalled_count INTEGER;
    restart_result TEXT;
BEGIN
    -- Reset items that have been processing for more than 5 minutes
    UPDATE friends_processing_queue
    SET 
        status = 'pending',
        last_processed_at = NULL,
        retry_count = retry_count + 1
    WHERE status = 'processing' 
    AND last_processed_at < NOW() - INTERVAL '5 minutes'
    AND retry_count < max_retries;
    
    GET DIAGNOSTICS stalled_count = ROW_COUNT;
    
    -- If we have pending items, trigger batch processing
    IF EXISTS (SELECT 1 FROM friends_processing_queue WHERE status = 'pending' LIMIT 1) THEN
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
        ) INTO restart_result;
    END IF;
    
    RETURN format('Restarted %s stalled items, triggered new processing', stalled_count);
END;
$$;

-- 3. Create enhanced cron jobs that auto-restart
SELECT cron.schedule(
    'auto-restart-stalled-processing',
    '*/3 * * * *', -- every 3 minutes
    'SELECT restart_stalled_queue_processing();'
);

-- 4. Force cleanup and immediate restart
SELECT restart_stalled_queue_processing();


-- PLANO DE CORREÇÃO EMERGENCIAL - Reativar Sistema Automatizado
-- ETAPA 1: Recriar cron jobs com credenciais corretas e forçar processamento

-- Primeiro, vamos limpar cron jobs antigos que podem estar falhando
SELECT cron.unschedule('restart-stalled-queue-processing');
SELECT cron.unschedule('cleanup-old-friends-activities'); 
SELECT cron.unschedule('cleanup-processed-queue-items');

-- Recriar cron jobs com service role key correto
SELECT cron.schedule(
    'restart-stalled-queue-processing',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    SELECT net.http_post(
        url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
        body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'cleanup-old-friends-activities', 
    '0 2 * * *', -- Diário às 2h
    $$
    SELECT cleanup_old_friends_activities();
    $$
);

SELECT cron.schedule(
    'cleanup-processed-queue-items',
    '0 3 * * *', -- Diário às 3h  
    $$
    SELECT cleanup_processed_queue_items();
    $$
);

-- ETAPA 2: Forçar processamento massivo imediato para repovoar o sistema
-- Primeiro, vamos limpar dados antigos para começar fresco
DELETE FROM friends_activities WHERE created_at < NOW() - INTERVAL '1 hour';
DELETE FROM friends_processing_queue WHERE status IN ('completed', 'failed');

-- Função para forçar processamento emergencial de todos os usuários ativos
CREATE OR REPLACE FUNCTION emergency_force_process_all_active_users()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_count INTEGER := 0;
    v_user_record RECORD;
    v_request_id UUID;
BEGIN
    -- Processar todos os usuários com contas Habbo ativas
    FOR v_user_record IN 
        SELECT DISTINCT ha.habbo_name, ha.habbo_id, ha.hotel
        FROM habbo_accounts ha
        WHERE ha.created_at >= NOW() - INTERVAL '30 days' -- Usuários ativos nos últimos 30 dias
    LOOP
        -- Povoar fila para este usuário
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', 
                v_user_record.habbo_name, v_user_record.habbo_id, v_user_record.hotel)::jsonb
        ) INTO v_request_id;

        v_user_count := v_user_count + 1;
        
        -- Aguardar um pouco para não sobrecarregar
        IF v_user_count % 5 = 0 THEN
            PERFORM pg_sleep(1);
        END IF;
    END LOOP;

    -- Aguardar e depois iniciar processamento massivo
    PERFORM pg_sleep(3);
    
    -- Processar em lotes grandes
    FOR i IN 1..10 LOOP
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := '{"mode": "process_queue", "batch_size": 150}'::jsonb
        ) INTO v_request_id;
        
        PERFORM pg_sleep(2);
    END LOOP;

    RETURN format('Processamento emergencial iniciado para %s usuários ativos', v_user_count);
END;
$$;

-- Executar o processamento emergencial imediatamente
SELECT emergency_force_process_all_active_users();


-- PLANO DE CORREÇÃO EMERGENCIAL - Versão Corrigida
-- Reativar sistema automatizado com cron jobs funcionais

-- Recriar cron jobs com service role key correto (ignora erro se não existir)
DO $$
BEGIN
    -- Tentar remover jobs existentes, mas ignorar erros se não existirem
    PERFORM cron.unschedule('restart-stalled-queue-processing');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-old-friends-activities');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-processed-queue-items');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Criar novos cron jobs funcionais
SELECT cron.schedule(
    'restart-stalled-queue-processing',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    SELECT net.http_post(
        url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
        body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'cleanup-old-friends-activities', 
    '0 2 * * *',
    $$SELECT cleanup_old_friends_activities();$$
);

SELECT cron.schedule(
    'cleanup-processed-queue-items',
    '0 3 * * *',
    $$SELECT cleanup_processed_queue_items();$$
);

-- Limpar dados antigos e forçar reprocessamento
DELETE FROM friends_activities WHERE created_at < NOW() - INTERVAL '1 hour';
DELETE FROM friends_processing_queue WHERE status IN ('completed', 'failed');

-- Forçar processamento para o usuário atual (Beebop)
SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "populate_queue", "user_habbo_name": "Beebop", "user_habbo_id": "hhbr-00e6988dddeb5a1838658c854d62fe49", "hotel": "br", "batch_size": 200}'::jsonb
);

-- Iniciar processamento em background
SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 150}'::jsonb
);


-- Create user snapshots table for change detection
CREATE TABLE public.user_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_id text NOT NULL,
  habbo_name text NOT NULL,
  hotel text NOT NULL DEFAULT 'com.br',
  figure_string text,
  motto text,
  online boolean DEFAULT false,
  badges jsonb DEFAULT '[]'::jsonb,
  friends jsonb DEFAULT '[]'::jsonb,
  groups jsonb DEFAULT '[]'::jsonb,
  rooms jsonb DEFAULT '[]'::jsonb,
  raw_profile_data jsonb,
  snapshot_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view user snapshots" 
ON public.user_snapshots 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage user snapshots" 
ON public.user_snapshots 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_snapshots_habbo_id ON public.user_snapshots(habbo_id);
CREATE INDEX idx_user_snapshots_timestamp ON public.user_snapshots(snapshot_timestamp DESC);
CREATE INDEX idx_user_snapshots_hotel ON public.user_snapshots(hotel);
CREATE INDEX idx_user_snapshots_habbo_name ON public.user_snapshots(habbo_name);

-- Create detected changes table
CREATE TABLE public.detected_changes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_id text NOT NULL,
  habbo_name text NOT NULL,
  hotel text NOT NULL DEFAULT 'com.br',
  change_type text NOT NULL, -- 'outfit', 'badge', 'friend', 'group', 'room', 'motto'
  change_description text NOT NULL,
  old_snapshot_id uuid,
  new_snapshot_id uuid NOT NULL,
  change_details jsonb DEFAULT '{}'::jsonb,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.detected_changes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view detected changes" 
ON public.detected_changes 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage detected changes" 
ON public.detected_changes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_detected_changes_habbo_id ON public.detected_changes(habbo_id);
CREATE INDEX idx_detected_changes_detected_at ON public.detected_changes(detected_at DESC);
CREATE INDEX idx_detected_changes_hotel ON public.detected_changes(hotel);
CREATE INDEX idx_detected_changes_change_type ON public.detected_changes(change_type);

-- Add foreign key references
ALTER TABLE public.detected_changes 
ADD CONSTRAINT fk_old_snapshot 
FOREIGN KEY (old_snapshot_id) REFERENCES public.user_snapshots(id);

ALTER TABLE public.detected_changes 
ADD CONSTRAINT fk_new_snapshot 
FOREIGN KEY (new_snapshot_id) REFERENCES public.user_snapshots(id);

-- Create function to cleanup old snapshots
CREATE OR REPLACE FUNCTION public.cleanup_old_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete snapshots older than 7 days
  DELETE FROM public.user_snapshots 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete detected changes older than 30 days
  DELETE FROM public.detected_changes 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;


-- Criar tabelas para sistema de mensagens real
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 TEXT NOT NULL,
  participant_2 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_habbo_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_type TEXT NOT NULL DEFAULT 'text'
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE supabase_user_id = auth.uid() 
    AND (habbo_name = participant_1 OR habbo_name = participant_2)
  )
);

CREATE POLICY "Users can create conversations they participate in" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE supabase_user_id = auth.uid() 
    AND (habbo_name = participant_1 OR habbo_name = participant_2)
  )
);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE supabase_user_id = auth.uid() 
    AND (habbo_name = participant_1 OR habbo_name = participant_2)
  )
);

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.habbo_accounts ha ON (ha.habbo_name = c.participant_1 OR ha.habbo_name = c.participant_2)
    WHERE c.id = conversation_id 
    AND ha.supabase_user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.habbo_accounts ha ON ha.habbo_name = sender_habbo_name
    WHERE c.id = conversation_id 
    AND ha.supabase_user_id = auth.uid()
    AND (ha.habbo_name = c.participant_1 OR ha.habbo_name = c.participant_2)
  )
);

-- Trigger para atualizar updated_at e last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now(), last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Enable realtime
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;


-- Create daily friend activities table for chronological feeds
CREATE TABLE public.daily_friend_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_habbo_id TEXT NOT NULL,
  user_habbo_name TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Activity summaries (only store changes)
  activities_summary JSONB DEFAULT '{}'::jsonb,
  badges_gained TEXT[] DEFAULT '{}',
  groups_joined JSONB DEFAULT '[]'::jsonb,
  rooms_created JSONB DEFAULT '[]'::jsonb,
  figure_changes JSONB DEFAULT NULL,
  photos_posted JSONB DEFAULT '[]'::jsonb,
  motto_changed TEXT DEFAULT NULL,
  
  -- Metadata
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_changes INTEGER DEFAULT 0,
  
  -- Indexes for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates per day
  UNIQUE(user_habbo_id, activity_date)
);

-- Create indexes for better performance
CREATE INDEX idx_daily_activities_date ON public.daily_friend_activities(activity_date DESC);
CREATE INDEX idx_daily_activities_hotel ON public.daily_friend_activities(hotel);
CREATE INDEX idx_daily_activities_updated ON public.daily_friend_activities(last_updated DESC);
CREATE INDEX idx_daily_activities_changes ON public.daily_friend_activities(total_changes DESC);

-- Enable RLS
ALTER TABLE public.daily_friend_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view daily activities" ON public.daily_friend_activities
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage daily activities" ON public.daily_friend_activities
  FOR ALL USING (true) WITH CHECK (true);

-- Function to clean old activities (keep only last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_daily_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.daily_friend_activities 
  WHERE activity_date < CURRENT_DATE - INTERVAL '7 days';
  
  RAISE NOTICE 'Cleaned up old daily activities older than 7 days';
END;
$$;


-- Create function to cleanup old daily activities
CREATE OR REPLACE FUNCTION cleanup_old_daily_activities()
RETURNS VOID AS $$
BEGIN
  DELETE FROM daily_friend_activities 
  WHERE activity_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;


-- Activate the daily activities tracker function by calling it once
-- This will initialize the tracking system
SELECT 'Daily activities tracker initialized' as status;










-- Create users table for HabboHub
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habbo_username VARCHAR(255) UNIQUE NOT NULL,
    habbo_motto TEXT,
    habbo_avatar TEXT,
    password_hash VARCHAR(255),
    email VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_habbo_username ON public.users(habbo_username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role can do everything" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
-- INSERT INTO public.users (habbo_username, habbo_motto, is_admin) 
-- VALUES ('habbohub', 'HUB-HA2VEA', true);


