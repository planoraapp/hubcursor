-- ========================================
-- SCRIPT DE LIMPEZA DO BANCO DE DADOS SUPABASE
-- Execute este script no SQL Editor do Supabase Dashboard
-- 
-- IMPORTANTE: Este script limpa:
-- 1. net._http_response (221 MB) - mantém últimos 7 dias
-- 2. cron.job_run_details (163 MB) - mantém últimos 30 dias  
-- 3. habbo_activities (9 MB) - mantém últimos 90 dias
-- 4. Snapshots antigos - mantém apenas o mais recente por usuário
-- ========================================

-- 1. VERIFICAR ESTATÍSTICAS ANTES DA LIMPEZA
-- ========================================

-- Verificar net._http_response
SELECT 
  'net._http_response' as tabela,
  COUNT(*) as total_registros,
  MIN(created) as primeira_requisicao,
  MAX(created) as ultima_requisicao,
  pg_size_pretty(pg_total_relation_size('net._http_response')) as tamanho
FROM net._http_response;

-- Verificar cron.job_run_details (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'cron' AND table_name = 'job_run_details') THEN
    RAISE NOTICE 'Tabela cron.job_run_details existe';
  ELSE
    RAISE NOTICE 'Tabela cron.job_run_details não existe';
  END IF;
END $$;

-- Verificar habbo_activities
SELECT 
  'public.habbo_activities' as tabela,
  COUNT(*) as total_registros,
  MIN(created_at) as primeira_atividade,
  MAX(created_at) as ultima_atividade,
  pg_size_pretty(pg_total_relation_size('public.habbo_activities')) as tamanho
FROM public.habbo_activities;

-- Verificar habbo_user_snapshots (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'habbo_user_snapshots') THEN
    RAISE NOTICE 'Tabela habbo_user_snapshots existe';
  ELSE
    RAISE NOTICE 'Tabela habbo_user_snapshots não existe';
  END IF;
END $$;

-- Verificar user_snapshots (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'user_snapshots') THEN
    RAISE NOTICE 'Tabela user_snapshots existe';
  ELSE
    RAISE NOTICE 'Tabela user_snapshots não existe';
  END IF;
END $$;

-- ========================================
-- 2. LIMPEZA DE net._http_response
-- ========================================
-- Limpar registros com mais de 7 dias (ou todos se não forem necessários)

-- Opção 1: Limpar todos os registros (RECOMENDADO se não há webhooks ativos)
DELETE FROM net._http_response 
WHERE created < NOW() - INTERVAL '7 days';

-- Opção 2: Limpar tudo (descomente se quiser remover completamente)
-- DELETE FROM net._http_response;

-- ========================================
-- 3. LIMPEZA DE cron.job_run_details
-- ========================================
-- Manter apenas registros dos últimos 30 dias

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'cron' AND table_name = 'job_run_details') THEN
    
    -- Limpar registros antigos
    DELETE FROM cron.job_run_details 
    WHERE end_time < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Limpeza de cron.job_run_details concluída';
  ELSE
    RAISE NOTICE 'Tabela cron.job_run_details não existe, pulando limpeza';
  END IF;
END $$;

-- ========================================
-- 4. CRIAR JOB AUTOMÁTICO PARA LIMPEZA FUTURA
-- ========================================
-- Este job executará limpeza automática todo domingo às 2h da manhã

DO $job$
DECLARE
  job_exists boolean;
BEGIN
  -- Verificar se pg_cron está instalado
  IF EXISTS (SELECT FROM pg_extension WHERE extname = 'pg_cron') THEN
    
    -- Verificar se o job já existe
    SELECT EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'cleanup-cron-history'
    ) INTO job_exists;
    
    IF NOT job_exists THEN
      -- Criar job de limpeza automática
      PERFORM cron.schedule(
        'cleanup-cron-history',
        '0 2 * * 0', -- Todo domingo às 2h da manhã
        $sql$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '30 days'$sql$
      );
      RAISE NOTICE 'Job automático de limpeza criado com sucesso';
    ELSE
      RAISE NOTICE 'Job automático já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Extensão pg_cron não está instalada. Job automático não pode ser criado.';
  END IF;
END $job$;

-- ========================================
-- 5. LIMPEZA DE habbo_activities
-- ========================================
-- Manter apenas atividades dos últimos 90 dias

DELETE FROM public.habbo_activities 
WHERE created_at < NOW() - INTERVAL '90 days';

-- ========================================
-- 6. LIMPEZA DE habbo_user_snapshots (se existir)
-- ========================================
-- Manter apenas o último snapshot por usuário

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'habbo_user_snapshots') THEN
    
    -- Deletar snapshots antigos, mantendo apenas o mais recente por usuário
    DELETE FROM public.habbo_user_snapshots 
    WHERE id NOT IN (
      SELECT DISTINCT ON (habbo_id) id 
      FROM public.habbo_user_snapshots 
      ORDER BY habbo_id, created_at DESC
    );
    
    RAISE NOTICE 'Limpeza de habbo_user_snapshots concluída';
  ELSE
    RAISE NOTICE 'Tabela habbo_user_snapshots não existe, pulando limpeza';
  END IF;
END $$;

-- ========================================
-- 7. LIMPEZA DE user_snapshots (se existir)
-- ========================================
-- Manter apenas o último snapshot por usuário

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'user_snapshots') THEN
    
    -- Deletar snapshots antigos, mantendo apenas o mais recente por usuário
    DELETE FROM public.user_snapshots 
    WHERE id NOT IN (
      SELECT DISTINCT ON (habbo_id) id 
      FROM public.user_snapshots 
      ORDER BY habbo_id, created_at DESC
    );
    
    RAISE NOTICE 'Limpeza de user_snapshots concluída';
  ELSE
    RAISE NOTICE 'Tabela user_snapshots não existe, pulando limpeza';
  END IF;
END $$;

-- ========================================
-- 8. VERIFICAR QUAIS TABELAS EXISTEM PARA VACUUM
-- ========================================
-- Esta query mostra quais tabelas existem e podem receber VACUUM

SELECT 
  schemaname || '.' || tablename as tabela,
  CASE 
    WHEN schemaname = 'net' AND tablename = '_http_response' THEN 'Execute: VACUUM ANALYZE net._http_response;'
    WHEN schemaname = 'cron' AND tablename = 'job_run_details' THEN 'Execute: VACUUM ANALYZE cron.job_run_details;'
    WHEN schemaname = 'public' AND tablename = 'habbo_activities' THEN 'Execute: VACUUM ANALYZE public.habbo_activities;'
    WHEN schemaname = 'public' AND tablename = 'habbo_user_snapshots' THEN 'Execute: VACUUM ANALYZE public.habbo_user_snapshots;'
    WHEN schemaname = 'public' AND tablename = 'user_snapshots' THEN 'Execute: VACUUM ANALYZE public.user_snapshots;'
  END as comando_vacuum
FROM pg_tables
WHERE (schemaname = 'net' AND tablename = '_http_response')
   OR (schemaname = 'cron' AND tablename = 'job_run_details')
   OR (schemaname = 'public' AND tablename IN ('habbo_activities', 'habbo_user_snapshots', 'user_snapshots'))
ORDER BY schemaname, tablename;

-- ========================================
-- 9. EXECUTAR VACUUM PARA RECUPERAR ESPAÇO
-- ========================================
-- ⚠️ IMPORTANTE: VACUUM não pode ser executado dentro de blocos transacionais
-- 
-- INSTRUÇÕES:
-- 1. Execute esta seção do script até a linha acima (seção 8)
-- 2. Verifique quais tabelas existem na query acima
-- 3. Execute os comandos VACUUM abaixo em uma NOVA QUERY separada no SQL Editor
--    (ou descomente os comandos necessários e execute esta seção novamente)
--
-- VACUUM para net._http_response (sempre execute este se a tabela existir)
VACUUM ANALYZE net._http_response;

-- Descomente e execute os comandos abaixo apenas se as tabelas correspondentes existirem:
-- (Execute cada um em uma query separada se necessário)

-- VACUUM ANALYZE cron.job_run_details;
-- VACUUM ANALYZE public.habbo_activities;
-- VACUUM ANALYZE public.habbo_user_snapshots;
-- VACUUM ANALYZE public.user_snapshots;

-- ========================================
-- 10. VERIFICAR ESTATÍSTICAS APÓS A LIMPEZA
-- ========================================

-- Verificar tamanho total do banco
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS tamanho_total
FROM pg_database
WHERE datname = current_database();

-- Verificar tamanho das tabelas principais
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho
FROM pg_tables
WHERE schemaname IN ('net', 'cron', 'public')
  AND tablename IN ('_http_response', 'job_run_details', 'habbo_activities', 'habbo_user_snapshots', 'user_snapshots')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- FIM DO SCRIPT
-- ========================================

