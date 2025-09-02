-- Create user snapshots table for change detection
CREATE TABLE public.user_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_id text NOT NULL,
  habbo_name text NOT NULL,
  hotel text NOT NULL DEFAULT 'com.br',
  figure_string text,
  motto text,
  online boolean DEFAULT false,
  badges jsonb DEFAULT '[]'::jsonb,
  friends jsonb DEFAULT '[]'::jsonb,
  groups jsonb DEFAULT '[]'::jsonb,
  rooms jsonb DEFAULT '[]'::jsonb,
  raw_profile_data jsonb,
  snapshot_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view user snapshots" 
ON public.user_snapshots 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage user snapshots" 
ON public.user_snapshots 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_snapshots_habbo_id ON public.user_snapshots(habbo_id);
CREATE INDEX idx_user_snapshots_timestamp ON public.user_snapshots(snapshot_timestamp DESC);
CREATE INDEX idx_user_snapshots_hotel ON public.user_snapshots(hotel);
CREATE INDEX idx_user_snapshots_habbo_name ON public.user_snapshots(habbo_name);

-- Create detected changes table
CREATE TABLE public.detected_changes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habbo_id text NOT NULL,
  habbo_name text NOT NULL,
  hotel text NOT NULL DEFAULT 'com.br',
  change_type text NOT NULL, -- 'outfit', 'badge', 'friend', 'group', 'room', 'motto'
  change_description text NOT NULL,
  old_snapshot_id uuid,
  new_snapshot_id uuid NOT NULL,
  change_details jsonb DEFAULT '{}'::jsonb,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.detected_changes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view detected changes" 
ON public.detected_changes 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage detected changes" 
ON public.detected_changes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_detected_changes_habbo_id ON public.detected_changes(habbo_id);
CREATE INDEX idx_detected_changes_detected_at ON public.detected_changes(detected_at DESC);
CREATE INDEX idx_detected_changes_hotel ON public.detected_changes(hotel);
CREATE INDEX idx_detected_changes_change_type ON public.detected_changes(change_type);

-- Add foreign key references
ALTER TABLE public.detected_changes 
ADD CONSTRAINT fk_old_snapshot 
FOREIGN KEY (old_snapshot_id) REFERENCES public.user_snapshots(id);

ALTER TABLE public.detected_changes 
ADD CONSTRAINT fk_new_snapshot 
FOREIGN KEY (new_snapshot_id) REFERENCES public.user_snapshots(id);

-- Create function to cleanup old snapshots
CREATE OR REPLACE FUNCTION public.cleanup_old_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete snapshots older than 7 days
  DELETE FROM public.user_snapshots 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete detected changes older than 30 days
  DELETE FROM public.detected_changes 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;