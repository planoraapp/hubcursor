-- Fix search_path warnings by adding SET search_path TO 'public' to functions

-- Update trigger_emergency_processing function
CREATE OR REPLACE FUNCTION trigger_emergency_processing(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'com.br'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- First populate the queue
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := format('{"mode": "populate_queue", "user_habbo_name": "%s", "user_habbo_id": "%s", "hotel": "%s", "batch_size": 200}', p_user_habbo_name, p_user_habbo_id, p_hotel)::jsonb
  ) INTO v_request_id;

  -- Wait a moment then start processing
  PERFORM pg_sleep(2);
  
  -- Process initial batch
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 100}'::jsonb
  ) INTO v_request_id;

  RETURN format('Emergency processing initiated for %s. Request ID: %s', p_user_habbo_name, v_request_id);
END;
$$;

-- Update other critical functions with search_path
CREATE OR REPLACE FUNCTION get_next_queue_batch(p_batch_size integer DEFAULT 50)
RETURNS TABLE(id uuid, user_habbo_name text, user_habbo_id text, hotel text, friend_habbo_name text, friend_habbo_id text, priority integer, retry_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Marcar items como 'processing' e retornar batch
  UPDATE friends_processing_queue
  SET 
    status = 'processing',
    last_processed_at = now()
  WHERE id IN (
    SELECT fq.id 
    FROM friends_processing_queue fq
    WHERE fq.status = 'pending' 
    AND fq.retry_count < fq.max_retries
    ORDER BY fq.priority DESC, fq.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  );

  -- Retornar os items que foram marcados para processamento
  RETURN QUERY
  SELECT 
    fq.id,
    fq.user_habbo_name,
    fq.user_habbo_id,
    fq.hotel,
    fq.friend_habbo_name,
    fq.friend_habbo_id,
    fq.priority,
    fq.retry_count
  FROM friends_processing_queue fq
  WHERE fq.status = 'processing' 
  AND fq.last_processed_at >= now() - INTERVAL '1 minute'
  ORDER BY fq.priority DESC, fq.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION mark_queue_item_completed(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE friends_processing_queue
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_queue_item_failed(p_id uuid, p_error_message text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE friends_processing_queue
  SET 
    status = CASE 
      WHEN retry_count >= max_retries THEN 'failed'
      ELSE 'pending'
    END,
    retry_count = retry_count + 1,
    error_message = p_error_message,
    updated_at = now(),
    last_processed_at = NULL
  WHERE id = p_id;
END;
$$;