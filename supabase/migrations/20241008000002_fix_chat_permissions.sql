-- Corrigir permissões do sistema de chat para usar habbo_accounts.id

-- Dropar políticas antigas
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view their blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can delete blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can view their reports" ON message_reports;
DROP POLICY IF EXISTS "Users can create reports" ON message_reports;

-- Função auxiliar para obter o ID do usuário logado na tabela habbo_accounts
CREATE OR REPLACE FUNCTION get_current_user_habbo_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM habbo_accounts WHERE habbo_id = current_user::text;
$$;

-- Políticas para chat_messages usando habbo_accounts.id
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (
    sender_id IN (SELECT id FROM habbo_accounts) OR 
    receiver_id IN (SELECT id FROM habbo_accounts)
  );

CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM habbo_accounts)
  );

CREATE POLICY "Users can update their messages"
  ON chat_messages FOR UPDATE
  USING (
    sender_id IN (SELECT id FROM habbo_accounts) OR 
    receiver_id IN (SELECT id FROM habbo_accounts)
  );

-- Políticas para user_blocks
CREATE POLICY "Users can view their blocks"
  ON user_blocks FOR SELECT
  USING (blocker_id IN (SELECT id FROM habbo_accounts));

CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (blocker_id IN (SELECT id FROM habbo_accounts));

CREATE POLICY "Users can delete blocks"
  ON user_blocks FOR DELETE
  USING (blocker_id IN (SELECT id FROM habbo_accounts));

-- Políticas para message_reports
CREATE POLICY "Users can view their reports"
  ON message_reports FOR SELECT
  USING (reporter_id IN (SELECT id FROM habbo_accounts));

CREATE POLICY "Users can create reports"
  ON message_reports FOR INSERT
  WITH CHECK (reporter_id IN (SELECT id FROM habbo_accounts));

-- Log de sucesso
SELECT 'Chat permissions fixed successfully' as status;

