-- Permitir que usuários autenticados vejam dados básicos do habbo_accounts
-- Isso é necessário para o sistema de chat mostrar nomes dos usuários

-- Dropar política existente se houver
DROP POLICY IF EXISTS "Authenticated users can view habbo accounts" ON habbo_accounts;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Authenticated users can view habbo accounts"
  ON habbo_accounts FOR SELECT
  TO authenticated
  USING (true);

