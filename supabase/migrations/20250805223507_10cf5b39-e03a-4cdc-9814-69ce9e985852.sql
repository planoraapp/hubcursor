
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
