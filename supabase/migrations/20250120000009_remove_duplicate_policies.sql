-- ========================================
-- REMOVE DUPLICATE AND PERMISSIVE POLICIES
-- ========================================
-- Remove políticas duplicadas e permissivas que ainda existem
-- após a aplicação da migração 20250120000007

-- ========================================
-- REMOVER POLÍTICAS PERMISSIVAS DE chat_messages
-- ========================================
DROP POLICY IF EXISTS "Anyone can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON chat_messages;

-- ========================================
-- REMOVER POLÍTICAS PERMISSIVAS DE user_blocks
-- ========================================
DROP POLICY IF EXISTS "Anyone can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Anyone can delete blocks" ON user_blocks;
DROP POLICY IF EXISTS "Anyone can view blocks" ON user_blocks;

-- ========================================
-- REMOVER POLÍTICAS PERMISSIVAS DE message_reports
-- ========================================
DROP POLICY IF EXISTS "Anyone can create reports" ON message_reports;
DROP POLICY IF EXISTS "Anyone can update reports" ON message_reports;
DROP POLICY IF EXISTS "Anyone can view reports" ON message_reports;

-- Comentário
COMMENT ON SCHEMA public IS 'Políticas permissivas removidas - migração 20250120000009';

