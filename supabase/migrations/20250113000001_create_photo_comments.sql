-- Create photo_comments table
CREATE TABLE IF NOT EXISTS photo_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  comment_text TEXT NOT NULL CHECK (length(comment_text) >= 1 AND length(comment_text) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS photo_comments_photo_id_idx ON photo_comments(photo_id);
CREATE INDEX IF NOT EXISTS photo_comments_user_id_idx ON photo_comments(user_id);
CREATE INDEX IF NOT EXISTS photo_comments_created_at_idx ON photo_comments(created_at);

-- Enable RLS
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all comments" ON photo_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own comments" ON photo_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON photo_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON photo_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photo_comments_updated_at 
  BEFORE UPDATE ON photo_comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
