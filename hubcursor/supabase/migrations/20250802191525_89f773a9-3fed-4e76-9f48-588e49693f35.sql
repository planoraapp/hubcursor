
-- Create habbo_badges table for tracking valid badges
CREATE TABLE IF NOT EXISTS public.habbo_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code TEXT NOT NULL UNIQUE,
  badge_name TEXT,
  source TEXT CHECK (source IN ('HabboWidgets', 'HabboAssets', 'SupabaseBucket')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ DEFAULT NOW(),
  validation_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_code ON public.habbo_badges(badge_code);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active) WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE public.habbo_badges ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active badges
CREATE POLICY "Allow read access to active badges" 
ON public.habbo_badges 
FOR SELECT 
USING (is_active = TRUE);

-- Create policy for service role to manage badges
CREATE POLICY "Allow service role to manage badges"
ON public.habbo_badges
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Create a function for periodic badge validation and cleanup
CREATE OR REPLACE FUNCTION public.validate_and_cleanup_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove badges not validated in the last 90 days
  DELETE FROM public.habbo_badges
  WHERE last_validated_at < NOW() - INTERVAL '90 days';

  -- Update validation status for stale badges
  UPDATE public.habbo_badges
  SET is_active = FALSE
  WHERE last_validated_at < NOW() - INTERVAL '30 days';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run validation periodically
CREATE OR REPLACE TRIGGER trigger_badge_validation
AFTER INSERT OR UPDATE ON public.habbo_badges
FOR EACH STATEMENT
EXECUTE FUNCTION public.validate_and_cleanup_badges();
