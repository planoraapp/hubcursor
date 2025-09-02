
-- Add the missing category column to forum_posts table
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS category text;
