-- ========================================
-- CORREÇÃO EMERGENCIAL: POLÍTICAS RLS PARA EDGE FUNCTIONS
-- ========================================

-- 1. Remover políticas conflitantes
DROP POLICY IF EXISTS "Service role can manage all habbo accounts" ON public.habbo_accounts;

-- 2. Criar política mais robusta para Edge Functions
CREATE POLICY "Edge Functions can manage habbo accounts"
  ON public.habbo_accounts
  FOR ALL
  USING (
    -- Permitir quando:
    -- 1. É o próprio usuário logado
    auth.uid() = supabase_user_id OR
    -- 2. É uma Edge Function com service role
    auth.role() = 'service_role' OR
    -- 3. É uma operação de sistema
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    -- Mesmas condições para INSERT/UPDATE
    auth.uid() = supabase_user_id OR
    auth.role() = 'service_role' OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- 3. Política específica para INSERT sem autenticação (registro)
CREATE POLICY "Allow registration via Edge Functions"
  ON public.habbo_accounts
  FOR INSERT
  WITH CHECK (
    -- Permitir INSERT quando não há usuário autenticado (registro inicial)
    auth.uid() IS NULL OR
    auth.uid() = supabase_user_id OR
    auth.role() = 'service_role'
  );

-- 4. Garantir que as outras políticas não conflitem
CREATE POLICY IF NOT EXISTS "Public read for profiles"
  ON public.habbo_accounts
  FOR SELECT
  USING (true); -- Permite leitura pública de perfis

-- 5. Log de sucesso
SELECT 'RLS policies updated successfully for Edge Functions' as status;

