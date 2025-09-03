
-- Create editor_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor_images',
  'editor_images', 
  true,
  52428800,
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create forum_images bucket if it doesn't exist  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum_images',
  'forum_images',
  true, 
  52428800,
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create site_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'site_images',
  'site_images',
  true,
  52428800, 
  ARRAY['image/png', 'image/gif', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for public read access to editor_images
CREATE POLICY IF NOT EXISTS "Public read access for editor_images" ON storage.objects
FOR SELECT USING (bucket_id = 'editor_images');

-- Set up RLS policies for public read access to forum_images  
CREATE POLICY IF NOT EXISTS "Public read access for forum_images" ON storage.objects
FOR SELECT USING (bucket_id = 'forum_images');

-- Set up RLS policies for public read access to site_images
CREATE POLICY IF NOT EXISTS "Public read access for site_images" ON storage.objects  
FOR SELECT USING (bucket_id = 'site_images');
