-- Migration: Create API cache table for unified API
-- Description: Create table for caching API responses to improve performance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create api_cache table
CREATE TABLE IF NOT EXISTS public.api_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON public.api_cache(key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON public.api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_priority ON public.api_cache(priority);
CREATE INDEX IF NOT EXISTS idx_api_cache_created_at ON public.api_cache(created_at);

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_cache 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_cache_updated_at
  BEFORE UPDATE ON public.api_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_api_cache_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_cache TO service_role;

-- Create RLS policies
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Policy for service role (can do everything)
CREATE POLICY "Service role can manage all cache entries"
  ON public.api_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Policy for authenticated users (read only)
CREATE POLICY "Authenticated users can read cache entries"
  ON public.api_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert initial cache cleanup job (if using pg_cron)
-- This would be set up separately in production
