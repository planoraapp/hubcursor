-- Create table for real friends activities
CREATE TABLE public.friends_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  activity_type TEXT NOT NULL, -- 'badge', 'friend_added', 'motto_change', 'photo_uploaded', 'room_visited', 'status_change'
  activity_description TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friends_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view friends activities" 
ON public.friends_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage friends activities" 
ON public.friends_activities 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_friends_activities_habbo_name_created_at 
ON public.friends_activities (habbo_name, created_at DESC);

CREATE INDEX idx_friends_activities_activity_type_created_at 
ON public.friends_activities (activity_type, created_at DESC);

-- Create function to clean old activities (keep only 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_friends_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.friends_activities 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;