
-- Create table to track which users we want to monitor
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

-- Create table to store user snapshots from Habbo API
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
  raw_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habbo_name, hotel, created_at)
);

-- Create table to store detected activities/changes
CREATE TABLE public.habbo_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'motto_change', 'avatar_update', 'new_badge', 'new_photo', 'new_friend', 'status_change'
  description TEXT NOT NULL,
  details JSONB,
  snapshot_id UUID REFERENCES public.habbo_user_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracked_habbo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (for the feed)
CREATE POLICY "Anyone can view tracked users" ON public.tracked_habbo_users FOR SELECT USING (true);
CREATE POLICY "Anyone can view snapshots" ON public.habbo_user_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON public.habbo_activities FOR SELECT USING (true);

-- Service role can manage all data
CREATE POLICY "Service role can manage tracked users" ON public.tracked_habbo_users FOR ALL USING (true);
CREATE POLICY "Service role can manage snapshots" ON public.habbo_user_snapshots FOR ALL USING (true);
CREATE POLICY "Service role can manage activities" ON public.habbo_activities FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_tracked_habbo_users_active ON public.tracked_habbo_users (is_active, hotel);
CREATE INDEX idx_habbo_user_snapshots_lookup ON public.habbo_user_snapshots (habbo_name, hotel, created_at DESC);
CREATE INDEX idx_habbo_activities_recent ON public.habbo_activities (created_at DESC, hotel);
CREATE INDEX idx_habbo_activities_by_user ON public.habbo_activities (habbo_name, hotel, created_at DESC);

-- Insert some popular users to track initially
INSERT INTO public.tracked_habbo_users (habbo_name, hotel) VALUES 
('HabboExplorer', 'com.br'),
('CyberHabbo', 'com.br'),
('DigitalDream', 'com.br'),
('VirtualLife', 'com.br'),
('RetroGamer', 'com.br'),
('HabboPro', 'com.br'),
('PixelDancer', 'com.br'),
('NetCitizen', 'com.br'),
('DigitalNinja', 'com.br'),
('OnlineUser', 'com.br'),
('HabboFan2024', 'com.br'),
('VirtualHero', 'com.br')
ON CONFLICT (habbo_name, hotel) DO NOTHING;

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the batch sync to run every 10 minutes
SELECT cron.schedule(
  'habbo-sync-batch',
  '*/10 * * * *', -- every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-batch',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
