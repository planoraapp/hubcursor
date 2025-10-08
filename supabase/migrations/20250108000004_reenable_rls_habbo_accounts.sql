-- ⚠️  MIGRATION AUTOMÁTICA - Row Level Security para habbo_accounts
-- Este script reabilita RLS com políticas adequadas
-- 
-- IMPORTANTE: Esta migration será aplicada automaticamente pelo Supabase
-- quando você fizer push para produção. Para aplicar manualmente em dev:
-- 
-- npx supabase db reset (reaplica todas as migrations)
-- ou
-- npx supabase migration up (aplica apenas pendentes)

-- ====================================================================
-- STEP 1: Reabilitar RLS
-- ====================================================================
ALTER TABLE habbo_accounts ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- STEP 2: Remover políticas antigas (se existirem)
-- ====================================================================
DROP POLICY IF EXISTS "Public read access" ON habbo_accounts;
DROP POLICY IF EXISTS "Users can update own account" ON habbo_accounts;
DROP POLICY IF EXISTS "Service role can insert" ON habbo_accounts;
DROP POLICY IF EXISTS "Enable read access for all users" ON habbo_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON habbo_accounts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON habbo_accounts;

-- ====================================================================
-- STEP 3: Criar políticas corretas
-- ====================================================================

-- Política 1: Leitura pública (necessária para chat funcionar)
-- Permite que qualquer usuário autenticado veja dados básicos de outros usuários
CREATE POLICY "Public read access for authenticated users"
  ON habbo_accounts
  FOR SELECT
  TO authenticated
  USING (true);

-- Política 2: Leitura pública anônima (necessária para perfis públicos)
-- Permite que visitantes vejam perfis sem estar logados
CREATE POLICY "Public read access for anonymous users"
  ON habbo_accounts
  FOR SELECT
  TO anon
  USING (true);

-- Política 3: Atualização apenas da própria conta
-- Usuários só podem atualizar seus próprios dados
CREATE POLICY "Users can update own account only"
  ON habbo_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = supabase_user_id::text)
  WITH CHECK (auth.uid()::text = supabase_user_id::text);

-- Política 4: Inserção apenas para service role
-- Novas contas só podem ser criadas via Edge Functions (service role)
CREATE POLICY "Service role can insert new accounts"
  ON habbo_accounts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Política 5: Deleção apenas para admins
-- Apenas usuários admin podem deletar contas
CREATE POLICY "Admins can delete accounts"
  ON habbo_accounts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habbo_accounts
      WHERE supabase_user_id = auth.uid()::text
      AND is_admin = true
    )
  );

-- ====================================================================
-- STEP 4: Verificar políticas criadas
-- ====================================================================
-- Execute esta query para confirmar:
-- SELECT * FROM pg_policies WHERE tablename = 'habbo_accounts';

-- ====================================================================
-- STEP 5: Testar acesso (OBRIGATÓRIO após aplicar)
-- ====================================================================
-- 1. Teste SELECT anônimo (deve funcionar):
--    curl -X GET 'https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts?select=habbo_name&limit=1'
--
-- 2. Teste SELECT autenticado (deve funcionar):
--    Fazer login no app e verificar se chat carrega conversas
--
-- 3. Teste UPDATE (deve funcionar apenas para própria conta):
--    Tentar atualizar motto no perfil próprio
--
-- 4. Teste INSERT direto (deve FALHAR - apenas service role):
--    Tentar criar conta via console do Supabase (deve retornar erro de permissão)

-- ====================================================================
-- ROLLBACK (em caso de problemas)
-- ====================================================================
-- Se algo der errado, execute:
-- ALTER TABLE habbo_accounts DISABLE ROW LEVEL SECURITY;
-- E reporte o erro para investigação

-- ====================================================================
-- NOTAS IMPORTANTES
-- ====================================================================
-- ✅ RLS habilitado com segurança
-- ✅ Chat continua funcionando (leitura pública)
-- ✅ Perfis públicos acessíveis
-- ✅ Usuários só podem editar própria conta
-- ✅ Criação de contas protegida (apenas via Edge Functions)
-- ✅ Deleção protegida (apenas admins)

-- 📝 Última atualização: 08/01/2025
-- 🔒 Status de segurança: PRODUÇÃO - RLS ATIVO

