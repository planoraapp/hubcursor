
-- Criar tabela para sistema de follows/seguindo
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_habbo_name TEXT NOT NULL,
  followed_habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, followed_user_id)
);

-- Adicionar RLS policies para user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" 
  ON public.user_follows 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can follow others" 
  ON public.user_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow" 
  ON public.user_follows 
  FOR DELETE 
  USING (auth.uid() = follower_user_id);

-- Inserir dados de teste para as fotos do Beebop
INSERT INTO public.habbo_photos (
  photo_id, habbo_name, habbo_id, hotel, s3_url, preview_url, 
  timestamp_taken, taken_date, likes_count, photo_type, source, caption
) VALUES 
  ('beebop-1754077680410', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754077680410.png', 1754077680410, '2025-01-08', 3, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1754044232199', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1754044232199.png', 1754044232199, '2025-01-08', 5, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569308915', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569308915.png', 1753569308915, '2025-07-26', 5, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569292755', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569292755.png', 1753569292755, '2025-07-26', 0, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1753569144621', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1753569144621.png', 1753569144621, '2025-07-26', 1, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1747003293190', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1747003293190.png', 1747003293190, '2025-05-11', 4, 'PHOTO', 'manual_insert', 'Foto do Beebop'),
  ('beebop-1742092026239', 'Beebop', 'hhbr-464837', 'br', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png', 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-464837-1742092026239.png', 1742092026239, '2025-03-15', 6, 'PHOTO', 'manual_insert', 'Foto do Beebop')
ON CONFLICT (photo_id, habbo_name, hotel) DO UPDATE SET
  likes_count = EXCLUDED.likes_count,
  updated_at = now();
