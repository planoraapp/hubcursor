
-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT,
  habbo_id TEXT,
  hotel TEXT,
  figure_string TEXT,
  motto TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_activities  
CREATE POLICY "Users can view all activities" ON public.user_activities
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to get public profile by habbo name
CREATE OR REPLACE FUNCTION get_habbo_account_public_by_name(habbo_name_param TEXT)
RETURNS TABLE (
  supabase_user_id UUID,
  habbo_name TEXT,
  habbo_id TEXT,
  hotel TEXT,
  figure_string TEXT,
  motto TEXT,
  is_online BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id as supabase_user_id,
    up.habbo_name,
    up.habbo_id,
    up.hotel,
    up.figure_string,
    up.motto,
    up.is_online,
    up.created_at,
    up.updated_at as last_updated
  FROM public.user_profiles up
  WHERE LOWER(up.habbo_name) = LOWER(habbo_name_param);
END;
$$;
