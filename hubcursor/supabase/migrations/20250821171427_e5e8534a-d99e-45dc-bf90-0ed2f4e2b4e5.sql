-- PLANO DE CORREÇÃO CRÍTICA ETAPA 1: Reativação do Sistema
-- Force populate queue for all active users and trigger immediate processing

-- 1. Trigger emergency processing for all active habbo accounts
DO $$
DECLARE
    account_rec RECORD;
    processing_count INTEGER := 0;
BEGIN
    -- Loop through all active habbo accounts and trigger emergency processing
    FOR account_rec IN 
        SELECT habbo_name, habbo_id, hotel 
        FROM habbo_accounts 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        LIMIT 10 -- Process 10 users at a time to avoid overload
    LOOP
        BEGIN
            -- Trigger emergency processing for each user
            PERFORM trigger_emergency_processing(
                account_rec.habbo_name, 
                account_rec.habbo_id, 
                account_rec.hotel
            );
            processing_count := processing_count + 1;
            
            -- Add small delay between requests to avoid overwhelming
            PERFORM pg_sleep(0.5);
            
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue processing other users
            RAISE NOTICE 'Error processing user %: %', account_rec.habbo_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Emergency processing triggered for % users', processing_count;
END $$;

-- 2. Create function to monitor and restart stalled processing
CREATE OR REPLACE FUNCTION restart_stalled_queue_processing()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    stalled_count INTEGER;
    restart_result TEXT;
BEGIN
    -- Reset items that have been processing for more than 5 minutes
    UPDATE friends_processing_queue
    SET 
        status = 'pending',
        last_processed_at = NULL,
        retry_count = retry_count + 1
    WHERE status = 'processing' 
    AND last_processed_at < NOW() - INTERVAL '5 minutes'
    AND retry_count < max_retries;
    
    GET DIAGNOSTICS stalled_count = ROW_COUNT;
    
    -- If we have pending items, trigger batch processing
    IF EXISTS (SELECT 1 FROM friends_processing_queue WHERE status = 'pending' LIMIT 1) THEN
        SELECT net.http_post(
            url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
            body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
        ) INTO restart_result;
    END IF;
    
    RETURN format('Restarted %s stalled items, triggered new processing', stalled_count);
END;
$$;

-- 3. Create enhanced cron jobs that auto-restart
SELECT cron.schedule(
    'auto-restart-stalled-processing',
    '*/3 * * * *', -- every 3 minutes
    'SELECT restart_stalled_queue_processing();'
);

-- 4. Force cleanup and immediate restart
SELECT restart_stalled_queue_processing();