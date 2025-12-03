-- ========================================
-- EXECUTAR LIMPEZA IMEDIATA DO HABBOHUB
-- Este script limpa as tabelas que ocupam mais espaço
-- ========================================

-- ANTES: Verificar tamanho atual
SELECT 
  'ANTES DA LIMPEZA' as status,
  pg_size_pretty(pg_database_size(current_database())) AS tamanho_total_banco;

-- ========================================
-- 1. LIMPAR net._http_response (221 MB)
-- ========================================

SELECT 'Limpando net._http_response...' as acao;

-- Verificar quantos registros existem
SELECT 
  COUNT(*) as registros_antes_limpeza
FROM net._http_response;

-- LIMPAR TUDO (você pode comentar esta linha e descomentar a próxima se quiser manter 7 dias)
DELETE FROM net._http_response;

-- OU manter últimos 7 dias (descomente se preferir):
-- DELETE FROM net._http_response WHERE created < NOW() - INTERVAL '7 days';

SELECT 
  COUNT(*) as registros_apos_limpeza,
  pg_size_pretty(pg_total_relation_size('net._http_response')) as tamanho_atual
FROM net._http_response;

-- ========================================
-- 2. LIMPAR habbo_activities antigas (9 MB)
-- ========================================

SELECT 'Limpando habbo_activities antigas (>90 dias)...' as acao;

SELECT COUNT(*) as registros_antes FROM public.habbo_activities;

-- Manter apenas últimos 90 dias
DELETE FROM public.habbo_activities 
WHERE created_at < NOW() - INTERVAL '90 days';

SELECT 
  COUNT(*) as registros_apos,
  pg_size_pretty(pg_total_relation_size('public.habbo_activities')) as tamanho_atual
FROM public.habbo_activities;

-- ========================================
-- 3. LIMPAR habbo_emotion_api_cache antiga (4 MB)
-- ========================================

SELECT 'Limpando cache de emotions antigo (>30 dias)...' as acao;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'habbo_emotion_api_cache'
             AND column_name IN ('created_at', 'updated_at')) THEN
    
    DELETE FROM public.habbo_emotion_api_cache 
    WHERE COALESCE(updated_at, created_at) < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Cache de emotions limpo';
  ELSE
    RAISE NOTICE 'Tabela habbo_emotion_api_cache não tem coluna de data, pulando';
  END IF;
END $$;

-- ========================================
-- 4. VERIFICAR RESULTADO
-- ========================================

SELECT 
  'DEPOIS DA LIMPEZA' as status,
  pg_size_pretty(pg_database_size(current_database())) AS tamanho_total_banco;

SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho
FROM pg_tables
WHERE (schemaname = 'net' AND tablename = '_http_response')
   OR (schemaname = 'public' AND tablename IN ('habbo_activities', 'habbo_emotion_api_cache'))
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- IMPORTANTE: Execute VACUUM em uma query SEPARADA
-- ========================================
-- Copie este comando e execute em uma NOVA QUERY:
-- VACUUM ANALYZE net._http_response;
-- VACUUM ANALYZE public.habbo_activities;

