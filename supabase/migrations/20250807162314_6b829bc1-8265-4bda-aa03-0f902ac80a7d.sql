
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
