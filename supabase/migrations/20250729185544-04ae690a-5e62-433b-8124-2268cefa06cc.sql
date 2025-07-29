
-- Create storage bucket for forum images
INSERT INTO storage.buckets (id, name, public)
VALUES ('habbo-hub-images', 'habbo-hub-images', true);

-- Create policy to allow public read access to the bucket
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'habbo-hub-images');

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'habbo-hub-images' AND auth.role() = 'authenticated');

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (bucket_id = 'habbo-hub-images' AND auth.uid()::text = (storage.foldername(name))[1]);
