
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
