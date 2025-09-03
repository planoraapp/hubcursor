-- Create a cron job to automatically sync tracked users every 30 minutes
SELECT cron.schedule(
  'habbo-batch-sync-auto',
  '*/30 * * * *', -- every 30 minutes
  $$
  SELECT
    net.http_post(
      url:='https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:='{"hotel": "com.br"}'::jsonb
    ) as request_id;
  $$
);