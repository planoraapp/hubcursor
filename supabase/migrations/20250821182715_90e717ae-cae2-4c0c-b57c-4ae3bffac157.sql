-- PLANO DE CORREÇÃO EMERGENCIAL - Reativar Sistema Automatizado
-- ETAPA 1: Recriar cron jobs com credenciais corretas e forçar processamento

-- Primeiro, vamos limpar cron jobs antigos que podem estar falhando
SELECT cron.unschedule('restart-stalled-queue-processing');
SELECT cron.unschedule('cleanup-old-friends-activities'); 
SELECT cron.unschedule('cleanup-processed-queue-items');

-- Recriar cron jobs com service role key correto
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
    '0 2 * * *', -- Diário às 2h
    $$
    SELECT cleanup_old_friends_activities();
    $$
);

SELECT cron.schedule(
    'cleanup-processed-queue-items',
    '0 3 * * *', -- Diário às 3h  
    $$
    SELECT cleanup_processed_queue_items();
    $$
);

-- ETAPA 2: Forçar processamento massivo imediato para repovoar o sistema
-- Primeiro, vamos limpar dados antigos para começar fresco
DELETE FROM friends_activities WHERE created_at < NOW() - INTERVAL '1 hour';
DELETE FROM friends_processing_queue WHERE status IN ('completed', 'failed');

-- Função para forçar processamento emergencial de todos os usuários ativos
CREATE OR REPLACE FUNCTION emergency_force_process_all_active_users()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_count INTEGER := 0;
    v_user_record RECORD;
    v_request_id UUID;
BEGIN
    -- Processar todos os usuários com contas Habbo ativas
    FOR v_user_record IN 
        SELECT DISTINCT ha.habbo_name, ha.habbo_id, ha.hotel
        FROM habbo_accounts ha
        WHERE ha.created_at >= NOW() - INTERVAL '30 days' -- Usuários ativos nos últimos 30 dias
    LOOP
        -- Povoar fila para este usuário
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', 
                v_user_record.habbo_name, v_user_record.habbo_id, v_user_record.hotel)::jsonb
        ) INTO v_request_id;

        v_user_count := v_user_count + 1;
        
        -- Aguardar um pouco para não sobrecarregar
        IF v_user_count % 5 = 0 THEN
            PERFORM pg_sleep(1);
        END IF;
    END LOOP;

    -- Aguardar e depois iniciar processamento massivo
    PERFORM pg_sleep(3);
    
    -- Processar em lotes grandes
    FOR i IN 1..10 LOOP
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := '{"mode": "process_queue", "batch_size": 150}'::jsonb
        ) INTO v_request_id;
        
        PERFORM pg_sleep(2);
    END LOOP;

    RETURN format('Processamento emergencial iniciado para %s usuários ativos', v_user_count);
END;
$$;

-- Executar o processamento emergencial imediatamente
SELECT emergency_force_process_all_active_users();