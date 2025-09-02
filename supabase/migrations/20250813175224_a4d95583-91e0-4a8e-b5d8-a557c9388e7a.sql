
-- Criar tabela para armazenar fotos dos usuários Habbo
CREATE TABLE public.habbo_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL, -- UUID da foto no Habbo
  habbo_name TEXT NOT NULL,
  habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  s3_url TEXT NOT NULL,
  preview_url TEXT,
  internal_user_id TEXT, -- ID interno extraído do S3 URL
  timestamp_taken BIGINT, -- Timestamp extraído do S3 URL
  caption TEXT,
  room_name TEXT,
  taken_date TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  photo_type TEXT DEFAULT 'PHOTO',
  source TEXT DEFAULT 'profile_scraping',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, habbo_name)
);

-- Adicionar RLS para permitir leitura pública das fotos
ALTER TABLE public.habbo_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view habbo photos" 
  ON public.habbo_photos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage habbo photos" 
  ON public.habbo_photos 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_habbo_photos_habbo_name ON public.habbo_photos(habbo_name);
CREATE INDEX idx_habbo_photos_hotel ON public.habbo_photos(hotel);
CREATE INDEX idx_habbo_photos_taken_date ON public.habbo_photos(taken_date DESC);
CREATE INDEX idx_habbo_photos_created_at ON public.habbo_photos(created_at DESC);

-- Modificar tabela habbo_activities para incluir eventos de fotos
ALTER TABLE public.habbo_activities 
ADD COLUMN IF NOT EXISTS photo_id TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_habbo_photos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_habbo_photos_updated_at
  BEFORE UPDATE ON public.habbo_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_habbo_photos_updated_at();
