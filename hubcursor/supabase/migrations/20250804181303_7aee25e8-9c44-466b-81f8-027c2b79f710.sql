-- Create table for caching HabboEmotion API clothing data
CREATE TABLE public.habbo_clothing_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  part TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'U',
  colors JSONB NOT NULL DEFAULT '["1", "2", "3", "4", "5"]'::jsonb,
  image_url TEXT,
  club TEXT NOT NULL DEFAULT 'FREE',
  source TEXT NOT NULL DEFAULT 'habboemotion-api',
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for item_id to prevent duplicates
CREATE UNIQUE INDEX idx_habbo_clothing_cache_item_id ON public.habbo_clothing_cache(item_id);

-- Create indexes for efficient querying
CREATE INDEX idx_habbo_clothing_cache_part ON public.habbo_clothing_cache(part);
CREATE INDEX idx_habbo_clothing_cache_gender ON public.habbo_clothing_cache(gender);
CREATE INDEX idx_habbo_clothing_cache_active ON public.habbo_clothing_cache(is_active);
CREATE INDEX idx_habbo_clothing_cache_synced_at ON public.habbo_clothing_cache(api_synced_at);

-- Enable RLS
ALTER TABLE public.habbo_clothing_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to active items
CREATE POLICY "Allow public read access to active clothing items" 
ON public.habbo_clothing_cache 
FOR SELECT 
USING (is_active = true);

-- Create policy for service role to manage data
CREATE POLICY "Allow service role to manage clothing cache" 
ON public.habbo_clothing_cache 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_habbo_clothing_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_habbo_clothing_cache_updated_at
BEFORE UPDATE ON public.habbo_clothing_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_habbo_clothing_cache_updated_at();