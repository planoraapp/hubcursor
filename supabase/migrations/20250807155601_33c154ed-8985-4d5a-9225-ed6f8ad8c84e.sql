
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
