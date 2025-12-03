-- ========================================
-- VERIFICAR STATUS DA LIMPEZA
-- Execute este script para ver se a limpeza funcionou
-- ========================================

-- 1. Verificar tamanho das tabelas que deveriam ter sido limpas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho_atual,
  pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE (schemaname = 'net' AND tablename = '_http_response')
   OR (schemaname = 'cron' AND tablename = 'job_run_details')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. Verificar quantos registros existem em net._http_response
SELECT 
  'net._http_response' as tabela,
  COUNT(*) as total_registros,
  pg_size_pretty(pg_total_relation_size('net._http_response')) as tamanho
FROM net._http_response;

-- 3. Verificar quantos registros existem em cron.job_run_details (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'cron' AND table_name = 'job_run_details') THEN
    RAISE NOTICE 'Tabela cron.job_run_details existe';
  ELSE
    RAISE NOTICE 'Tabela cron.job_run_details NÃO existe';
  END IF;
END $$;

-- 4. Listar as 20 maiores tabelas do banco
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho,
  pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE schemaname IN ('public', 'net', 'cron', 'storage')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- 5. Verificar se os jobs automáticos foram criados
SELECT 
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname IN ('cleanup-http-response', 'cleanup-cron-history')
ORDER BY jobname;

