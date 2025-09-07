-- ========================================
-- CORREÇÃO FINAL DO SISTEMA DE HOME
-- Adaptar tabelas de home para funcionar com hub_users
-- ========================================

-- 1. Remover foreign key constraints que referenciam auth.users
ALTER TABLE public.user_home_backgrounds DROP CONSTRAINT IF EXISTS user_home_backgrounds_user_id_fkey;
ALTER TABLE public.user_stickers DROP CONSTRAINT IF EXISTS user_stickers_user_id_fkey;
ALTER TABLE public.guestbook_entries DROP CONSTRAINT IF EXISTS guestbook_entries_home_owner_user_id_fkey;
ALTER TABLE public.guestbook_entries DROP CONSTRAINT IF EXISTS guestbook_entries_author_user_id_fkey;

-- 2. Criar dados de home para usuários existentes em hub_users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, habbo_username, hotel FROM public.hub_users
  LOOP
    -- Inserir background pastel para cada usuário
    INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value, created_at, updated_at)
    VALUES (user_record.id, 'color', '#e8f4fd', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      background_value = EXCLUDED.background_value,
      updated_at = NOW();

    -- Inserir widgets padrão para cada usuário
    INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible, config, created_at, updated_at)
    VALUES 
      (user_record.id, 'avatar', 20, 20, 1, 520, 180, true, '{"showBadges": true, "showMotto": true}', NOW(), NOW()),
      (user_record.id, 'guestbook', 50, 220, 1, 420, 380, true, '{"maxMessages": 10, "allowAnonymous": true}', NOW(), NOW()),
      (user_record.id, 'rating', 500, 220, 1, 320, 160, true, '{"showStars": true, "allowRating": true}', NOW(), NOW()),
      (user_record.id, 'welcome', 20, 420, 1, 800, 120, true, '{"message": "Bem-vindo à minha Habbo Home!", "showDate": true}', NOW(), NOW())
    ON CONFLICT (user_id, widget_type) DO UPDATE SET
      x = EXCLUDED.x,
      y = EXCLUDED.y,
      width = EXCLUDED.width,
      height = EXCLUDED.height,
      is_visible = EXCLUDED.is_visible,
      config = EXCLUDED.config,
      updated_at = NOW();

    -- Inserir stickers decorativos para cada usuário
    INSERT INTO public.user_stickers (user_id, sticker_id, sticker_src, x, y, z_index, created_at)
    VALUES 
      (user_record.id, 'heart_' || user_record.id, '/images/stickers/heart.png', 100, 100, 2, NOW()),
      (user_record.id, 'star_' || user_record.id, '/images/stickers/star.png', 700, 150, 2, NOW()),
      (user_record.id, 'flower_' || user_record.id, '/images/stickers/flower.png', 300, 500, 2, NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Home criada para usuário: % (%)', user_record.habbo_username, user_record.id;
  END LOOP;
END $$;

-- 3. Verificar se as homes foram criadas
SELECT 
  h.habbo_username,
  h.hotel,
  bg.background_value,
  COUNT(DISTINCT w.id) as widgets,
  COUNT(DISTINCT s.id) as stickers
FROM public.hub_users h
LEFT JOIN public.user_home_backgrounds bg ON h.id = bg.user_id
LEFT JOIN public.user_home_widgets w ON h.id = w.user_id
LEFT JOIN public.user_stickers s ON h.id = s.user_id
GROUP BY h.id, h.habbo_username, h.hotel, bg.background_value
ORDER BY h.habbo_username;

-- 4. Criar função para inicializar home de novos usuários hub_users
CREATE OR REPLACE FUNCTION public.initialize_hub_user_home_complete(user_uuid uuid, habbo_username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background pastel
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value, created_at, updated_at)
  VALUES (user_uuid, 'color', '#e8f4fd', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible, config, created_at, updated_at)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true, '{"showBadges": true, "showMotto": true}', NOW(), NOW()),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true, '{"maxMessages": 10, "allowAnonymous": true}', NOW(), NOW()),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true, '{"showStars": true, "allowRating": true}', NOW(), NOW()),
    (user_uuid, 'welcome', 20, 420, 1, 800, 120, true, '{"message": "Bem-vindo à minha Habbo Home!", "showDate": true}', NOW(), NOW())
  ON CONFLICT (user_id, widget_type) DO NOTHING;

  -- Inserir stickers decorativos
  INSERT INTO public.user_stickers (user_id, sticker_id, sticker_src, x, y, z_index, created_at)
  VALUES 
    (user_uuid, 'heart_' || user_uuid, '/images/stickers/heart.png', 100, 100, 2, NOW()),
    (user_uuid, 'star_' || user_uuid, '/images/stickers/star.png', 700, 150, 2, NOW()),
    (user_uuid, 'flower_' || user_uuid, '/images/stickers/flower.png', 300, 500, 2, NOW())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Home inicializada para usuário: % (%)', habbo_username, user_uuid;
END;
$$;

-- 5. Criar trigger para auto-inicialização de home para novos usuários hub_users
CREATE OR REPLACE FUNCTION public.trigger_initialize_hub_user_home_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.initialize_hub_user_home_complete(NEW.id, NEW.habbo_username);
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela hub_users
DROP TRIGGER IF EXISTS trigger_hub_user_home_complete_init ON public.hub_users;
CREATE TRIGGER trigger_hub_user_home_complete_init
  AFTER INSERT ON public.hub_users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_initialize_hub_user_home_complete();
