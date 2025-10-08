-- Simplificar permissões do chat (temporariamente mais permissivas para authenticated users)

-- Dropar políticas existentes
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view their blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can delete blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can view their reports" ON message_reports;
DROP POLICY IF EXISTS "Users can create reports" ON message_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON message_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON message_reports;

-- Políticas permissivas para chat_messages (qualquer usuário autenticado)
CREATE POLICY "Authenticated users can view messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para user_blocks
CREATE POLICY "Authenticated users can view blocks"
  ON user_blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blocks"
  ON user_blocks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blocks"
  ON user_blocks FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para message_reports
CREATE POLICY "Authenticated users can view reports"
  ON message_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON message_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reports"
  ON message_reports FOR UPDATE
  TO authenticated
  USING (true);

-- Log de sucesso
SELECT 'Chat permissions simplified successfully' as status;

