-- PLANO DE CORREÇÃO EMERGENCIAL - Versão Corrigida
-- Reativar sistema automatizado com cron jobs funcionais

-- Recriar cron jobs com service role key correto (ignora erro se não existir)
DO $$
BEGIN
    -- Tentar remover jobs existentes, mas ignorar erros se não existirem
    PERFORM cron.unschedule('restart-stalled-queue-processing');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-old-friends-activities');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM cron.unschedule('cleanup-processed-queue-items');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Criar novos cron jobs funcionais
SELECT cron.schedule(
    'restart-stalled-queue-processing',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    SELECT net.http_post(
        url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
        body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
    );
    $$
);

SELECT cron.schedule(
    'cleanup-old-friends-activities', 
    '0 2 * * *',
    $$SELECT cleanup_old_friends_activities();$$
);

SELECT cron.schedule(
    'cleanup-processed-queue-items',
    '0 3 * * *',
    $$SELECT cleanup_processed_queue_items();$$
);

-- Limpar dados antigos e forçar reprocessamento
DELETE FROM friends_activities WHERE created_at < NOW() - INTERVAL '1 hour';
DELETE FROM friends_processing_queue WHERE status IN ('completed', 'failed');

-- Forçar processamento para o usuário atual (Beebop)
SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "populate_queue", "user_habbo_name": "Beebop", "user_habbo_id": "hhbr-00e6988dddeb5a1838658c854d62fe49", "hotel": "br", "batch_size": 200}'::jsonb
);

-- Iniciar processamento em background
SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 150}'::jsonb
);