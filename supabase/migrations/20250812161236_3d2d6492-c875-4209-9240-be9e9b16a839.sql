
-- Create table for tracking which users we should monitor
CREATE TABLE public.tracked_habbo_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'com.br',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel)
);

-- Create table for storing user snapshots (complete state at a point in time)
CREATE TABLE public.habbo_user_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  motto TEXT,
  figure_string TEXT,
  is_online BOOLEAN DEFAULT false,
  last_web_visit TIMESTAMP WITH TIME ZONE,
  member_since TIMESTAMP WITH TIME ZONE,
  badges_count INTEGER DEFAULT 0,
  photos_count INTEGER DEFAULT 0,
  friends_count INTEGER DEFAULT 0,
  groups_count INTEGER DEFAULT 0,
  raw_data JSONB, -- Complete API response for detailed comparisons
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing computed activities/diffs
CREATE TABLE public.habbo_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'motto_change', 'avatar_update', 'new_badge', 'new_photo', 'new_friend', 'new_group', 'status_change', 'user_tracked'
  description TEXT NOT NULL, -- Human readable description in PT-BR
  details JSONB, -- Specific details about the change (counts, items, etc.)
  snapshot_id UUID REFERENCES public.habbo_user_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables (public read, service role write)
ALTER TABLE public.tracked_habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_activities ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view tracked users" ON public.tracked_habbo_users FOR SELECT USING (true);
CREATE POLICY "Anyone can view snapshots" ON public.habbo_user_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON public.habbo_activities FOR SELECT USING (true);

-- Service role can manage everything
CREATE POLICY "Service role can manage tracked users" ON public.tracked_habbo_users FOR ALL USING (true);
CREATE POLICY "Service role can manage snapshots" ON public.habbo_user_snapshots FOR ALL USING (true);
CREATE POLICY "Service role can manage activities" ON public.habbo_activities FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_tracked_users_active ON public.tracked_habbo_users(is_active, hotel);
CREATE INDEX idx_snapshots_user_time ON public.habbo_user_snapshots(habbo_name, hotel, created_at DESC);
CREATE INDEX idx_activities_user_time ON public.habbo_activities(habbo_name, hotel, created_at DESC);
CREATE INDEX idx_activities_type_time ON public.habbo_activities(activity_type, created_at DESC);

-- Insert some initial users to track (including 'adami' from your example)
INSERT INTO public.tracked_habbo_users (habbo_name, habbo_id, hotel, is_active) VALUES
('adami', 'hhbr-ba7f01c16650fcd3f7c874d0ba2a845d', 'com.br', true),
('Beebop', 'hhbr-example-beebop', 'com.br', true),
('habbohub', 'hhbr-example-habbohub', 'com.br', true)
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- Enable pg_cron extension for scheduled syncing
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule batch sync every 3 minutes
SELECT cron.schedule(
  'habbo-sync-batch',
  '*/3 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.WrczBcDnftc1SiSjpUTepwSgH14ZBQP_QGqRKYvJQNA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
