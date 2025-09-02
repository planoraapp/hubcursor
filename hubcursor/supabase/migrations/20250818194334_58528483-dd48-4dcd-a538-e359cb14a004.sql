
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
