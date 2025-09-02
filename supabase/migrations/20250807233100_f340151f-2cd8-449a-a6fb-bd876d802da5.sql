
-- 1) Índice único para suportar ON CONFLICT (user_id) em user_home_backgrounds
CREATE UNIQUE INDEX IF NOT EXISTS user_home_backgrounds_unique_user
  ON public.user_home_backgrounds(user_id);

-- 2) RPC pública (SECURITY DEFINER) para buscar dados mínimos da conta por nome
CREATE OR REPLACE FUNCTION public.get_habbo_account_public_by_name(habbo_name_param text)
RETURNS TABLE (
  supabase_user_id uuid,
  habbo_name text,
  habbo_id text,
  hotel text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ha.supabase_user_id, ha.habbo_name, ha.habbo_id, ha.hotel
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
  LIMIT 1;
END;
$$;

-- 3) RPC pública (SECURITY DEFINER) para obter o e-mail de auth a partir do nome
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo(habbo_name_param text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
  LIMIT 1;

  RETURN v_email;
END;
$$;

-- 4) Privilégios de execução para as RPCs
REVOKE ALL ON FUNCTION public.get_habbo_account_public_by_name(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_auth_email_for_habbo(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_habbo_account_public_by_name(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_auth_email_for_habbo(text) TO anon, authenticated, service_role;

-- 5) Gatilho: inicializar Home ao inserir uma nova habbo_account
DROP TRIGGER IF EXISTS trg_handle_new_user_home ON public.habbo_accounts;

CREATE TRIGGER trg_handle_new_user_home
AFTER INSERT ON public.habbo_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_home();
