-- Create comment_reports table for moderation
CREATE TABLE public.comment_reports (
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

-- Enable RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_reports
CREATE POLICY "Users can report comments" 
ON public.comment_reports 
FOR INSERT 
WITH CHECK (auth.uid()::text = reporter_user_id::text);

CREATE POLICY "Users can view their own reports" 
ON public.comment_reports 
FOR SELECT 
USING (auth.uid()::text = reporter_user_id::text);

-- Create index for better performance
CREATE INDEX idx_comment_reports_comment_id ON public.comment_reports(comment_id);
CREATE INDEX idx_comment_reports_status ON public.comment_reports(status);

-- Add delete policy for photo_comments (users can delete their own comments)
CREATE POLICY "Users can delete their own comments" 
ON public.photo_comments 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Add policy for photo owners to delete comments on their photos
-- We'll need to check if the user owns the photo through photo_likes table
CREATE POLICY "Photo owners can delete comments on their photos" 
ON public.photo_comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.photos p 
    WHERE p.id = photo_comments.photo_id 
    AND p.user_id::text = auth.uid()::text
  )
);