
-- Create tables for console interactions (likes, comments, follows)
CREATE TABLE IF NOT EXISTS console_profile_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_habbo_name)
);

CREATE TABLE IF NOT EXISTS console_profile_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_habbo_name TEXT NOT NULL,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS console_profile_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  target_habbo_name TEXT NOT NULL,
  target_habbo_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_user_id, target_habbo_name)
);

-- Enable RLS
ALTER TABLE console_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_profile_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_profile_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for console_profile_likes
CREATE POLICY "Anyone can view likes" ON console_profile_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like profiles" ON console_profile_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" ON console_profile_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for console_profile_comments
CREATE POLICY "Anyone can view comments" ON console_profile_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON console_profile_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON console_profile_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON console_profile_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for console_profile_follows
CREATE POLICY "Anyone can view follows" ON console_profile_follows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow profiles" ON console_profile_follows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow profiles" ON console_profile_follows
  FOR DELETE USING (auth.uid() = follower_user_id);
