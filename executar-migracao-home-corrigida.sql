-- ========================================
-- MIGRATION: AUTO-INICIALIZAÇÃO DE HOME PARA HUB_USERS (CORRIGIDA)
-- Sistema automático de criação de home para novos usuários
-- ========================================

-- Primeiro, vamos verificar a estrutura atual das tabelas
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_home_backgrounds', 'user_home_widgets', 'user_stickers')
ORDER BY table_name, ordinal_position;

-- Verificar constraints de foreign key
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('user_home_backgrounds', 'user_home_widgets', 'user_stickers');

-- Função para inicializar home padrão para usuários hub_users (CORRIGIDA)
CREATE OR REPLACE FUNCTION public.initialize_hub_user_home(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Verificar se o usuário existe em hub_users
  IF NOT EXISTS (SELECT 1 FROM public.hub_users WHERE id = user_uuid) THEN
    RAISE EXCEPTION 'Usuário % não encontrado em hub_users', user_uuid;
  END IF;

  -- Inserir background padrão pastel se não existir
  -- Usar o ID do hub_users diretamente (sem foreign key para auth.users)
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#e8f4fd') -- Cor pastel azul claro
  ON CONFLICT (user_id) DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_widgets (user_id, widget_type, x, y, z_index, width, height, is_visible, config)
  VALUES 
    (user_uuid, 'avatar', 20, 20, 1, 520, 180, true, '{"showBadges": true, "showMotto": true}'),
    (user_uuid, 'guestbook', 50, 220, 1, 420, 380, true, '{"maxMessages": 10, "allowAnonymous": true}'),
    (user_uuid, 'rating', 500, 220, 1, 320, 160, true, '{"showStars": true, "allowRating": true}'),
    (user_uuid, 'welcome', 20, 420, 1, 800, 120, true, '{"message": "Bem-vindo à minha Habbo Home!", "showDate": true}')
  ON CONFLICT (user_id, widget_type) DO NOTHING;

  -- Inserir alguns stickers decorativos padrão
  INSERT INTO public.user_stickers (user_id, sticker_id, sticker_src, x, y, z_index)
  VALUES 
    (user_uuid, 'heart_1', '/images/stickers/heart.png', 100, 100, 2),
    (user_uuid, 'star_1', '/images/stickers/star.png', 700, 150, 2),
    (user_uuid, 'flower_1', '/images/stickers/flower.png', 300, 500, 2)
  ON CONFLICT DO NOTHING;

  -- Log da inicialização
  RAISE NOTICE 'Home inicializada para usuário: %', user_uuid;
END;
$$;

-- Função para verificar e inicializar home se necessário
CREATE OR REPLACE FUNCTION public.ensure_hub_user_home_exists(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Verificar se o usuário já tem home configurada
  IF NOT EXISTS (
    SELECT 1 FROM public.user_home_backgrounds WHERE user_id = user_uuid
  ) THEN
    -- Inicializar home padrão
    PERFORM public.initialize_hub_user_home(user_uuid);
  END IF;
END;
$$;

-- Trigger para auto-inicialização quando um usuário é inserido em hub_users
CREATE OR REPLACE FUNCTION public.trigger_initialize_hub_user_home()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inicializar home para o novo usuário
  PERFORM public.ensure_hub_user_home_exists(NEW.id);
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela hub_users
DROP TRIGGER IF EXISTS trigger_hub_user_home_init ON public.hub_users;
CREATE TRIGGER trigger_hub_user_home_init
  AFTER INSERT ON public.hub_users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_initialize_hub_user_home();

-- Inicializar home para usuários existentes que não têm home
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM public.hub_users 
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_home_backgrounds WHERE user_id = hub_users.id
    )
  LOOP
    BEGIN
      PERFORM public.ensure_hub_user_home_exists(user_record.id);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao inicializar home para usuário %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- Verificar se a home foi criada para habbohub
SELECT 
  h.habbo_username,
  h.hotel,
  bg.background_value,
  COUNT(w.id) as widget_count
FROM public.hub_users h
LEFT JOIN public.user_home_backgrounds bg ON h.id = bg.user_id
LEFT JOIN public.user_home_widgets w ON h.id = w.user_id
WHERE h.habbo_username = 'habbohub'
GROUP BY h.id, h.habbo_username, h.hotel, bg.background_value;
