-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to process friends queue every 2 minutes
SELECT cron.schedule(
  'process-friends-queue',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "process_queue", "batch_size": 50}'::jsonb
  ) as request_id;
  $$
);

-- Create cron job to populate queue for active users every 10 minutes
SELECT cron.schedule(
  'populate-friends-queue', 
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-batch-friends-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc0MDIwOCwiZXhwIjoyMDUwMzE2MjA4fQ.fAPEqW7jJUHFYLQf1H1WUW0PzPfTytHI1scPsX91pJE"}'::jsonb,
    body := '{"mode": "populate_queue", "user_habbo_name": "Beebop", "user_habbo_id": "hhbr-9d61d51f6b532511b0311ceadb484369", "hotel": "com.br", "batch_size": 100}'::jsonb
  ) as request_id;
  $$
);

-- Function to trigger emergency processing for a specific user
CREATE OR REPLACE FUNCTION trigger_emergency_processing(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'com.br'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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