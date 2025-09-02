
-- Create home_assets table for managing all asset types
CREATE TABLE public.home_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Stickers', 'Mockups', 'Montáveis', 'Ícones', 'Papel de Parede', 'Animados')),
  file_path text NOT NULL,
  bucket_name text NOT NULL DEFAULT 'home-assets',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_home_assets_category ON public.home_assets(category);
CREATE INDEX idx_home_assets_active ON public.home_assets(is_active);

-- Enable RLS
ALTER TABLE public.home_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for home_assets
CREATE POLICY "Anyone can view active home assets" 
ON public.home_assets FOR SELECT 
USING (is_active = true);

CREATE POLICY "Service role can manage home assets"
ON public.home_assets FOR ALL 
USING (true)
WITH CHECK (true);

-- Update user_stickers table to include z_index controls
ALTER TABLE public.user_stickers 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_home_assets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER home_assets_updated_at
  BEFORE UPDATE ON public.home_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_home_assets_updated_at();

CREATE TRIGGER user_stickers_updated_at
  BEFORE UPDATE ON public.user_stickers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
