
-- Create RPC function to get habbo account by name and hotel
CREATE OR REPLACE FUNCTION public.get_habbo_account_public_by_name_and_hotel(
  habbo_name_param text, 
  hotel_param text
)
RETURNS TABLE(supabase_user_id uuid, habbo_name text, habbo_id text, hotel text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT ha.supabase_user_id, ha.habbo_name, ha.habbo_id, ha.hotel
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;
END;
$$;

-- Update the existing RPC to also handle hotel-aware auth email lookup
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo_with_hotel(
  habbo_name_param text,
  hotel_param text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  IF hotel_param IS NOT NULL THEN
    -- Search for specific hotel first
    SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
    FROM public.habbo_accounts ha
    WHERE lower(ha.habbo_name) = lower(habbo_name_param)
      AND ha.hotel = hotel_param
    LIMIT 1;
  END IF;
  
  -- If not found or no hotel specified, search without hotel filter
  IF v_email IS NULL THEN
    SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
    FROM public.habbo_accounts ha
    WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    LIMIT 1;
  END IF;

  RETURN v_email;
END;
$$;
