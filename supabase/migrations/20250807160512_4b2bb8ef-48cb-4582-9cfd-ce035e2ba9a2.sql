
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
