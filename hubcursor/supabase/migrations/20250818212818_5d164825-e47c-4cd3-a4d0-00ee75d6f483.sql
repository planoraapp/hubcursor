
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
