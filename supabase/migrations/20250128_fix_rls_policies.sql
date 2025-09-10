-- ========================================
-- AJUSTAR POLÍTICAS RLS PARA CONTA HABBOHUB
-- ========================================

-- 1. Adicionar política para permitir leitura pública de contas (para verificação de existência)
CREATE POLICY "Public can view habbo accounts for verification"
  ON public.habbo_accounts
  FOR SELECT
  USING (true);

-- 2. Adicionar política para permitir inserção de contas especiais (habbohub)
CREATE POLICY "Allow special account creation"
  ON public.habbo_accounts
  FOR INSERT
  WITH CHECK (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  );

-- 3. Adicionar política para permitir atualização de contas especiais
CREATE POLICY "Allow special account updates"
  ON public.habbo_accounts
  FOR UPDATE
  USING (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  )
  WITH CHECK (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  );

-- 4. Adicionar política para permitir exclusão de contas especiais
CREATE POLICY "Allow special account deletion"
  ON public.habbo_accounts
  FOR DELETE
  USING (
    habbo_name = 'habbohub' AND hotel = 'br' OR
    current_setting('role', true) = 'service_role'
  );

-- 5. Criar índice para performance na busca por habbo_name e hotel
CREATE INDEX IF NOT EXISTS idx_habbo_accounts_name_hotel 
ON public.habbo_accounts (habbo_name, hotel);
