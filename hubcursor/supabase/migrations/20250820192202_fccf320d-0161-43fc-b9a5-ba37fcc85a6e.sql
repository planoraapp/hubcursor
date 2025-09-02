-- Create comment_reports table for moderation (simplified)
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  reporter_user_id UUID NOT NULL,
  reporter_habbo_name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_admin TEXT
);

-- Enable RLS only if table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comment_reports' AND table_schema = 'public') THEN
    ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY IF NOT EXISTS "Users can report comments" 
    ON public.comment_reports 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = reporter_user_id::text);

    CREATE POLICY IF NOT EXISTS "Users can view their own reports" 
    ON public.comment_reports 
    FOR SELECT 
    USING (auth.uid()::text = reporter_user_id::text);

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON public.comment_reports(comment_id);
    CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON public.comment_reports(status);
  END IF;
END
$$;