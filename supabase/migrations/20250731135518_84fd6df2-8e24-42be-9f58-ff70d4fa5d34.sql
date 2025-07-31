-- Create photo_likes table for social interactions
CREATE TABLE public.photo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Create photo_comments table for photo discussions
CREATE TABLE public.photo_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_followers table for following system
CREATE TABLE public.user_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  followed_habbo_id TEXT NOT NULL,
  followed_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, followed_habbo_id)
);

-- Enable RLS on all tables
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo_likes
CREATE POLICY "Users can view all photo likes" 
ON public.photo_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like photos" 
ON public.photo_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.photo_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for photo_comments
CREATE POLICY "Users can view all photo comments" 
ON public.photo_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can comment on photos" 
ON public.photo_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own comments" 
ON public.photo_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.photo_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for user_followers
CREATE POLICY "Users can view all followers" 
ON public.user_followers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow others" 
ON public.user_followers 
FOR INSERT 
WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow" 
ON public.user_followers 
FOR DELETE 
USING (auth.uid() = follower_user_id);

-- Create indexes for better performance
CREATE INDEX idx_photo_likes_photo_id ON public.photo_likes(photo_id);
CREATE INDEX idx_photo_likes_user_id ON public.photo_likes(user_id);
CREATE INDEX idx_photo_comments_photo_id ON public.photo_comments(photo_id);
CREATE INDEX idx_photo_comments_user_id ON public.photo_comments(user_id);
CREATE INDEX idx_user_followers_follower ON public.user_followers(follower_user_id);
CREATE INDEX idx_user_followers_followed ON public.user_followers(followed_habbo_id);