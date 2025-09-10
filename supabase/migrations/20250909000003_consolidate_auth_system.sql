-- ========================================
-- CONSOLIDAÇÃO DO SISTEMA DE AUTENTICAÇÃO
-- Garantir que todas as referências usem apenas habbo_accounts
-- ========================================

-- 1. GARANTIR QUE A TABELA HABBO_ACCOUNTS TENHA TODOS OS CAMPOS NECESSÁRIOS
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS habbo_id text,
ADD COLUMN IF NOT EXISTS hotel text DEFAULT 'br',
ADD COLUMN IF NOT EXISTS figure_string text,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. CRIAR CONSTRAINTS ÚNICOS PARA EVITAR DUPLICAÇÕES
ALTER TABLE public.habbo_accounts 
ADD CONSTRAINT IF NOT EXISTS unique_habbo_name_hotel 
UNIQUE (habbo_name, hotel);

ALTER TABLE public.habbo_accounts 
ADD CONSTRAINT IF NOT EXISTS unique_habbo_id_hotel 
UNIQUE (habbo_id, hotel);

-- 3. CRIAR FUNÇÃO PARA BUSCAR CONTA HABBO POR NOME E HOTEL
CREATE OR REPLACE FUNCTION public.get_habbo_account_by_name(
  habbo_name_param text,
  hotel_param text DEFAULT 'br'
)
RETURNS TABLE(
  id uuid,
  supabase_user_id uuid,
  habbo_name text,
  habbo_id text,
  hotel text,
  figure_string text,
  motto text,
  is_online boolean,
  is_admin boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ha.id,
    ha.supabase_user_id,
    ha.habbo_name,
    ha.habbo_id,
    ha.hotel,
    ha.figure_string,
    ha.motto,
    ha.is_online,
    ha.is_admin,
    ha.created_at
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;
END;
$$;

-- 4. CRIAR FUNÇÃO PARA BUSCAR EMAIL DE AUTENTICAÇÃO
CREATE OR REPLACE FUNCTION public.get_auth_email_for_habbo(
  habbo_name_param text,
  hotel_param text DEFAULT 'br'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT concat(ha.habbo_id, '@habbohub.com') INTO v_email
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;

  RETURN v_email;
END;
$$;

-- 5. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO É ADMIN
CREATE OR REPLACE FUNCTION public.is_habbo_user_admin(
  habbo_name_param text,
  hotel_param text DEFAULT 'br'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_admin boolean := false;
BEGIN
  SELECT ha.is_admin INTO v_is_admin
  FROM public.habbo_accounts ha
  WHERE lower(ha.habbo_name) = lower(habbo_name_param)
    AND ha.hotel = hotel_param
  LIMIT 1;

  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- 6. CRIAR TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION public.update_habbo_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_habbo_accounts_updated_at ON public.habbo_accounts;
CREATE TRIGGER update_habbo_accounts_updated_at
  BEFORE UPDATE ON public.habbo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_habbo_accounts_updated_at();

-- 7. CRIAR POLÍTICAS RLS ROBUSTAS
DROP POLICY IF EXISTS "Users can view their own habbo account" ON public.habbo_accounts;
DROP POLICY IF EXISTS "Users can insert their own habbo account" ON public.habbo_accounts;
DROP POLICY IF EXISTS "Users can update their own habbo account" ON public.habbo_accounts;
DROP POLICY IF EXISTS "Service role can manage all habbo accounts" ON public.habbo_accounts;

CREATE POLICY "Users can view their own habbo account"
  ON public.habbo_accounts
  FOR SELECT
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own habbo account"
  ON public.habbo_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update their own habbo account"
  ON public.habbo_accounts
  FOR UPDATE
  USING (auth.uid() = supabase_user_id)
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Service role can manage all habbo accounts"
  ON public.habbo_accounts
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON FUNCTION public.get_habbo_account_by_name IS 'Busca conta Habbo por nome e hotel';
COMMENT ON FUNCTION public.get_auth_email_for_habbo IS 'Busca email de autenticação para conta Habbo';
COMMENT ON FUNCTION public.is_habbo_user_admin IS 'Verifica se usuário Habbo é administrador';
