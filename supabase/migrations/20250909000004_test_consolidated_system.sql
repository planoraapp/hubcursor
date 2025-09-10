-- ========================================
-- TESTE DO SISTEMA CONSOLIDADO
-- Verificar se todas as funcionalidades estão funcionando
-- ========================================

-- 1. VERIFICAR SE AS CONTAS PRINCIPAIS EXISTEM
DO $$
DECLARE
  beebop_count integer;
  habbohub_count integer;
BEGIN
  -- Verificar conta Beebop
  SELECT COUNT(*) INTO beebop_count
  FROM public.habbo_accounts 
  WHERE habbo_name = 'Beebop' AND hotel = 'br';
  
  -- Verificar conta habbohub
  SELECT COUNT(*) INTO habbohub_count
  FROM public.habbo_accounts 
  WHERE habbo_name = 'habbohub' AND hotel = 'br';
  
  -- Log dos resultados
  RAISE NOTICE 'Conta Beebop encontrada: %', beebop_count > 0;
  RAISE NOTICE 'Conta habbohub encontrada: %', habbohub_count > 0;
  
  -- Verificar se ambas as contas existem
  IF beebop_count = 0 THEN
    RAISE WARNING 'Conta Beebop não encontrada!';
  END IF;
  
  IF habbohub_count = 0 THEN
    RAISE WARNING 'Conta habbohub não encontrada!';
  END IF;
END $$;

-- 2. TESTAR FUNÇÕES CRIADAS
DO $$
DECLARE
  beebop_email text;
  habbohub_email text;
  beebop_is_admin boolean;
  habbohub_is_admin boolean;
BEGIN
  -- Testar função de email
  SELECT public.get_auth_email_for_habbo('Beebop', 'br') INTO beebop_email;
  SELECT public.get_auth_email_for_habbo('habbohub', 'br') INTO habbohub_email;
  
  -- Testar função de admin
  SELECT public.is_habbo_user_admin('Beebop', 'br') INTO beebop_is_admin;
  SELECT public.is_habbo_user_admin('habbohub', 'br') INTO habbohub_is_admin;
  
  -- Log dos resultados
  RAISE NOTICE 'Email Beebop: %', beebop_email;
  RAISE NOTICE 'Email habbohub: %', habbohub_email;
  RAISE NOTICE 'Beebop é admin: %', beebop_is_admin;
  RAISE NOTICE 'habbohub é admin: %', habbohub_is_admin;
END $$;

-- 3. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
DO $$
DECLARE
  habbo_accounts_count integer;
  console_likes_count integer;
  console_comments_count integer;
  console_follows_count integer;
  home_widgets_count integer;
  home_backgrounds_count integer;
  home_ratings_count integer;
BEGIN
  -- Contar registros nas tabelas principais
  SELECT COUNT(*) INTO habbo_accounts_count FROM public.habbo_accounts;
  SELECT COUNT(*) INTO console_likes_count FROM public.console_profile_likes;
  SELECT COUNT(*) INTO console_comments_count FROM public.console_profile_comments;
  SELECT COUNT(*) INTO console_follows_count FROM public.console_profile_follows;
  SELECT COUNT(*) INTO home_widgets_count FROM public.user_home_widgets;
  SELECT COUNT(*) INTO home_backgrounds_count FROM public.user_home_backgrounds;
  SELECT COUNT(*) INTO home_ratings_count FROM public.user_home_ratings;
  
  -- Log dos resultados
  RAISE NOTICE 'Total contas habbo_accounts: %', habbo_accounts_count;
  RAISE NOTICE 'Total likes console: %', console_likes_count;
  RAISE NOTICE 'Total comentários console: %', console_comments_count;
  RAISE NOTICE 'Total follows console: %', console_follows_count;
  RAISE NOTICE 'Total widgets home: %', home_widgets_count;
  RAISE NOTICE 'Total backgrounds home: %', home_backgrounds_count;
  RAISE NOTICE 'Total ratings home: %', home_ratings_count;
END $$;

-- 4. VERIFICAR ÍNDICES CRIADOS
DO $$
DECLARE
  index_count integer;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
    AND tablename IN ('habbo_accounts', 'console_profile_likes', 'console_profile_comments', 'console_profile_follows');
  
  RAISE NOTICE 'Total de índices criados: %', index_count;
END $$;
