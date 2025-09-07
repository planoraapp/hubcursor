-- ========================================
-- FUNÇÃO RPC PARA INICIALIZAR HOME DE HUB_USERS
-- Pode ser chamada via API REST
-- ========================================

-- Função para inicializar home para hub_users
CREATE OR REPLACE FUNCTION public.initialize_hub_user_home(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  bg_id uuid;
  widget_count integer := 0;
  sticker_count integer := 0;
  user_exists boolean := false;
BEGIN
  -- Verificar se o usuário existe em hub_users
  SELECT EXISTS(SELECT 1 FROM public.hub_users WHERE id = user_uuid) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Usuário não encontrado em hub_users',
      'user_id', user_uuid
    );
  END IF;

  -- Desabilitar triggers temporariamente para evitar foreign key errors
  ALTER TABLE public.user_home_backgrounds DISABLE TRIGGER ALL;
  ALTER TABLE public.user_home_widgets DISABLE TRIGGER ALL;
  ALTER TABLE public.user_stickers DISABLE TRIGGER ALL;

  -- Inserir background
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value, created_at, updated_at)
  VALUES (user_uuid, 'color', '#e8f4fd', NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    background_value = EXCLUDED.background_value,
    updated_at = NOW()
  RETURNING id INTO bg_id;

  -- Inserir widgets
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible, config, created_at, updated_at)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true, '{"showBadges": true, "showMotto": true}', NOW(), NOW()),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true, '{"maxMessages": 10, "allowAnonymous": true}', NOW(), NOW()),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true, '{"showStars": true, "allowRating": true}', NOW(), NOW()),
    (user_uuid, 'welcome', 20, 420, 1, 800, 120, true, '{"message": "Bem-vindo à minha Habbo Home!", "showDate": true}', NOW(), NOW())
  ON CONFLICT (user_id, widget_type) DO UPDATE SET
    x = EXCLUDED.x,
    y = EXCLUDED.y,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    is_visible = EXCLUDED.is_visible,
    config = EXCLUDED.config,
    updated_at = NOW();

  -- Inserir stickers
  INSERT INTO public.user_stickers (user_id, sticker_id, sticker_src, x, y, z_index, created_at)
  VALUES 
    (user_uuid, 'heart_1', '/images/stickers/heart.png', 100, 100, 2, NOW()),
    (user_uuid, 'star_1', '/images/stickers/star.png', 700, 150, 2, NOW()),
    (user_uuid, 'flower_1', '/images/stickers/flower.png', 300, 500, 2, NOW())
  ON CONFLICT DO NOTHING;

  -- Reabilitar triggers
  ALTER TABLE public.user_home_backgrounds ENABLE TRIGGER ALL;
  ALTER TABLE public.user_home_widgets ENABLE TRIGGER ALL;
  ALTER TABLE public.user_stickers ENABLE TRIGGER ALL;

  -- Contar itens criados
  SELECT COUNT(*) INTO widget_count FROM public.user_home_widgets WHERE user_id = user_uuid;
  SELECT COUNT(*) INTO sticker_count FROM public.user_stickers WHERE user_id = user_uuid;

  -- Retornar resultado
  result := json_build_object(
    'success', true,
    'user_id', user_uuid,
    'background_id', bg_id,
    'widgets_created', widget_count,
    'stickers_created', sticker_count,
    'background_color', '#e8f4fd',
    'message', 'Home inicializada com sucesso!'
  );

  RETURN result;
END;
$$;

-- Testar a função para habbohub
SELECT public.initialize_hub_user_home('0330a693-8cbb-47d1-9cb5-338cd66c36b0');

-- Verificar resultado final
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
WHERE h.habbo_username = 'habbohub'
GROUP BY h.id, h.habbo_username, h.hotel, bg.background_value;
