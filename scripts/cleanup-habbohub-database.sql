-- ========================================
-- SCRIPT DE LIMPEZA DO BANCO DE DADOS HABBOHUB
-- Projeto: wueccgeizznjmjgmuscy
-- Execute este script no SQL Editor do Supabase Dashboard
-- ========================================

-- ========================================
-- PASSO 1: VERIFICAR ESTATÍSTICAS ANTES DA LIMPEZA
-- ========================================

-- Verificar tamanho total do banco
SELECT 
  pg_database.datname as database,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS tamanho_total
FROM pg_database
WHERE datname = current_database();

-- Verificar tamanho das tabelas que vamos limpar
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE (schemaname = 'net' AND tablename = '_http_response')
   OR (schemaname = 'cron' AND tablename = 'job_run_details')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- PASSO 2: LIMPAR net._http_response (221 MB)
-- ========================================

-- Verificar quantos registros existem
SELECT 
  COUNT(*) as total_registros,
  MIN(created) as primeira_requisicao,
  MAX(created) as ultima_requisicao
FROM net._http_response;

-- OPÇÃO 1: Limpar TODOS os registros (RECOMENDADO se não há webhooks ativos)
DELETE FROM net._http_response;

-- OPÇÃO 2: Manter apenas últimos 7 dias (descomente se preferir)
-- DELETE FROM net._http_response 
-- WHERE created < NOW() - INTERVAL '7 days';

-- Verificar quanto foi deletado
SELECT 
  COUNT(*) as registros_restantes,
  pg_size_pretty(pg_total_relation_size('net._http_response')) AS tamanho_atual
FROM net._http_response;

-- ========================================
-- PASSO 3: LIMPAR cron.job_run_details (163 MB)
-- ========================================

-- Verificar se a tabela existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'cron' AND table_name = 'job_run_details') THEN
    
    -- Verificar quantos registros existem
    RAISE NOTICE 'Tabela cron.job_run_details existe';
    
    -- Limpar registros com mais de 30 dias
    DELETE FROM cron.job_run_details 
    WHERE end_time < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Limpeza de cron.job_run_details concluída';
  ELSE
    RAISE NOTICE 'Tabela cron.job_run_details não existe no banco';
  END IF;
END $$;

-- ========================================
-- PASSO 4: CRIAR JOB AUTOMÁTICO PARA LIMPEZA FUTURA
-- ========================================

-- Verificar se pg_cron está instalado
DO $job$
DECLARE
  job_exists boolean;
BEGIN
  IF EXISTS (SELECT FROM pg_extension WHERE extname = 'pg_cron') THEN
    
    -- Verificar se o job já existe
    SELECT EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'cleanup-cron-history'
    ) INTO job_exists;
    
    IF NOT job_exists THEN
      -- Criar job de limpeza automática para net._http_response
      PERFORM cron.schedule(
        'cleanup-http-response',
        '0 3 * * 0', -- Todo domingo às 3h da manhã
        $sql$DELETE FROM net._http_response WHERE created < now() - interval '7 days'$sql$
      );
      
      -- Criar job de limpeza automática para cron.job_run_details
      PERFORM cron.schedule(
        'cleanup-cron-history',
        '0 2 * * 0', -- Todo domingo às 2h da manhã
        $sql$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '30 days'$sql$
      );
      
      RAISE NOTICE 'Jobs automáticos de limpeza criados com sucesso';
    ELSE
      RAISE NOTICE 'Jobs automáticos já existem';
    END IF;
  ELSE
    RAISE NOTICE 'Extensão pg_cron não está instalada. Jobs automáticos não podem ser criados.';
    RAISE NOTICE 'Para instalar: CREATE EXTENSION IF NOT EXISTS pg_cron;';
  END IF;
END $job$;

-- ========================================
-- PASSO 5: VERIFICAR ESPAÇO LIBERADO
-- ========================================

SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('net', 'cron')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verificar tamanho total do banco após limpeza
SELECT 
  pg_database.datname as database,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS tamanho_total
FROM pg_database
WHERE datname = current_database();

-- ========================================
-- PASSO 6: EXECUTAR VACUUM PARA RECUPERAR ESPAÇO
-- ========================================
-- ⚠️ IMPORTANTE: Execute estes comandos SEPARADAMENTE em uma NOVA QUERY
-- VACUUM não pode rodar dentro de blocos transacionais

-- Copie e execute cada um destes comandos em queries separadas:

-- VACUUM ANALYZE net._http_response;

-- Se cron.job_run_details existir:
-- VACUUM ANALYZE cron.job_run_details;

-- ========================================
-- RESUMO DO QUE FOI FEITO:
-- ========================================
-- 
-- ✅ Limpeza de net._http_response (221 MB → ~32 KB)
-- ✅ Limpeza de cron.job_run_details (163 MB → 5-10 MB mantendo 30 dias)
-- ✅ Jobs automáticos criados para limpeza semanal
-- ⚠️ VACUUM precisa ser executado manualmente (veja Passo 6)
--
-- Espaço estimado liberado: ~380 MB
--
-- ========================================
-- FIM DO SCRIPT
-- ========================================

