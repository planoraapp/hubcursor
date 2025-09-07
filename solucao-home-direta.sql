-- ========================================
-- SOLUÇÃO DIRETA: CRIAR HOME PARA HABBOHUB
-- Inserir dados diretamente nas tabelas de home
-- ========================================

-- 1. Inserir background pastel para habbohub
INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
VALUES ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'color', '#e8f4fd')
ON CONFLICT (user_id) DO UPDATE SET
  background_value = EXCLUDED.background_value,
  updated_at = NOW();

-- 2. Inserir widgets padrão para habbohub
INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible, config)
VALUES 
  ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'avatar', 20, 20, 1, 520, 180, true, '{"showBadges": true, "showMotto": true}'),
  ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'guestbook', 50, 220, 1, 420, 380, true, '{"maxMessages": 10, "allowAnonymous": true}'),
  ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'rating', 500, 220, 1, 320, 160, true, '{"showStars": true, "allowRating": true}'),
  ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'welcome', 20, 420, 1, 800, 120, true, '{"message": "Bem-vindo à minha Habbo Home!", "showDate": true}')
ON CONFLICT (user_id, widget_type) DO UPDATE SET
  x = EXCLUDED.x,
  y = EXCLUDED.y,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  is_visible = EXCLUDED.is_visible,
  config = EXCLUDED.config;

-- 3. Inserir stickers decorativos para habbohub
INSERT INTO public.user_stickers (user_id, sticker_id, sticker_src, x, y, z_index)
VALUES 
  ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'heart_1', '/images/stickers/heart.png', 100, 100, 2),
  ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'star_1', '/images/stickers/star.png', 700, 150, 2),
  ('0330a693-8cbb-47d1-9cb5-338cd66c36b0', 'flower_1', '/images/stickers/flower.png', 300, 500, 2)
ON CONFLICT DO NOTHING;

-- 4. Verificar se foi criada corretamente
SELECT 
  'Background' as tipo,
  background_value as valor,
  created_at
FROM public.user_home_backgrounds 
WHERE user_id = '0330a693-8cbb-47d1-9cb5-338cd66c36b0'

UNION ALL

SELECT 
  'Widgets' as tipo,
  COUNT(*)::text as valor,
  MAX(created_at) as created_at
FROM public.user_home_widgets 
WHERE user_id = '0330a693-8cbb-47d1-9cb5-338cd66c36b0'

UNION ALL

SELECT 
  'Stickers' as tipo,
  COUNT(*)::text as valor,
  MAX(created_at) as created_at
FROM public.user_stickers 
WHERE user_id = '0330a693-8cbb-47d1-9cb5-338cd66c36b0';
