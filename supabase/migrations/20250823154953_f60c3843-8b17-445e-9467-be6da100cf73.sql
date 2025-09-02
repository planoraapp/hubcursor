-- Create daily friend activities table for chronological feeds
CREATE TABLE public.daily_friend_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_habbo_id TEXT NOT NULL,
  user_habbo_name TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Activity summaries (only store changes)
  activities_summary JSONB DEFAULT '{}'::jsonb,
  badges_gained TEXT[] DEFAULT '{}',
  groups_joined JSONB DEFAULT '[]'::jsonb,
  rooms_created JSONB DEFAULT '[]'::jsonb,
  figure_changes JSONB DEFAULT NULL,
  photos_posted JSONB DEFAULT '[]'::jsonb,
  motto_changed TEXT DEFAULT NULL,
  
  -- Metadata
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_changes INTEGER DEFAULT 0,
  
  -- Indexes for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates per day
  UNIQUE(user_habbo_id, activity_date)
);

-- Create indexes for better performance
CREATE INDEX idx_daily_activities_date ON public.daily_friend_activities(activity_date DESC);
CREATE INDEX idx_daily_activities_hotel ON public.daily_friend_activities(hotel);
CREATE INDEX idx_daily_activities_updated ON public.daily_friend_activities(last_updated DESC);
CREATE INDEX idx_daily_activities_changes ON public.daily_friend_activities(total_changes DESC);

-- Enable RLS
ALTER TABLE public.daily_friend_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view daily activities" ON public.daily_friend_activities
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage daily activities" ON public.daily_friend_activities
  FOR ALL USING (true) WITH CHECK (true);

-- Function to clean old activities (keep only last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_daily_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.daily_friend_activities 
  WHERE activity_date < CURRENT_DATE - INTERVAL '7 days';
  
  RAISE NOTICE 'Cleaned up old daily activities older than 7 days';
END;
$$;