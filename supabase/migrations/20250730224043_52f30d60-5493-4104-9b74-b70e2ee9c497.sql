
-- Create the habbo_figures_cache table for storing figure data
CREATE TABLE IF NOT EXISTS public.habbo_figures_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS but make it public for the edge function to access
ALTER TABLE public.habbo_figures_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for edge function)
CREATE POLICY "Allow public read access for figure cache" 
  ON public.habbo_figures_cache 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow public insert access (for edge function)
CREATE POLICY "Allow public insert access for figure cache" 
  ON public.habbo_figures_cache 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create policy to allow public delete access (for cleanup)
CREATE POLICY "Allow public delete access for expired cache" 
  ON public.habbo_figures_cache 
  FOR DELETE 
  TO public
  USING (expires_at < now());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_habbo_figures_cache_expires_at ON public.habbo_figures_cache(expires_at);
