-- ========================================
-- CRIAR RPC PARA INICIALIZAR HOME DE HUB_USERS
-- Função que funciona sem foreign keys
-- ========================================

-- Função para inicializar home para hub_users (sem foreign key)
CREATE OR REPLACE FUNCTION public.create_hub_user_home(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  bg_id uuid;
  widget_count integer;
  sticker_count integer;
BEGIN
  -- Verificar se o usuário existe em hub_users
  IF NOT EXISTS (SELECT 1 FROM public.hub_users WHERE id = user_uuid) THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado em hub_users');
  END IF;

  -- Inserir background
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#e8f4fd')
  ON CONFLICT (user_id) DO UPDATE SET
    background_value = EXCLUDED.background_value,
    updated_at = NOW()
  RETURNING id INTO bg_id;

  -- Inserir widgets
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible, config)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true, '{"showBadges": true, "showMotto": true}'),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true, '{"maxMessages": 10, "allowAnonymous": true}'),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true, '{"showStars": true, "allowRating": true}'),
    (user_uuid, 'welcome', 20, 420, 1, 800, 120, true, '{"message": "Bem-vindo à minha Habbo Home!", "showDate": true}')
  ON CONFLICT (user_id, widget_type) DO NOTHING;

  -- Inserir stickers
  INSERT INTO public.user_stickers (user_id, sticker_id, sticker_src, x, y, z_index)
  VALUES 
    (user_uuid, 'heart_1', '/images/stickers/heart.png', 100, 100, 2),
    (user_uuid, 'star_1', '/images/stickers/star.png', 700, 150, 2),
    (user_uuid, 'flower_1', '/images/stickers/flower.png', 300, 500, 2)
  ON CONFLICT DO NOTHING;

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
    'message', 'Home criada com sucesso!'
  );

  RETURN result;
END;
$$;

-- Testar a função para habbohub
SELECT public.create_hub_user_home('0330a693-8cbb-47d1-9cb5-338cd66c36b0');

-- Verificar resultado
SELECT 
  h.habbo_username,
  bg.background_value,
  COUNT(w.id) as widgets,
  COUNT(s.id) as stickers
FROM public.hub_users h
LEFT JOIN public.user_home_backgrounds bg ON h.id = bg.user_id
LEFT JOIN public.user_home_widgets w ON h.id = w.user_id
LEFT JOIN public.user_stickers s ON h.id = s.user_id
WHERE h.habbo_username = 'habbohub'
GROUP BY h.id, h.habbo_username, bg.background_value;
