-- Fix security issue: Restrict habbo_user_snapshots access to authenticated users only
-- This prevents competitors from scraping user data while maintaining functionality

-- Drop the overly permissive policy that allows anyone to view snapshots
DROP POLICY IF EXISTS "Anyone can view snapshots" ON public.habbo_user_snapshots;

-- Create a new policy that requires authentication to view snapshots
CREATE POLICY "Authenticated users can view snapshots" 
ON public.habbo_user_snapshots 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the service role policy for backend operations (unchanged)
-- "Service role can manage snapshots" policy remains as is