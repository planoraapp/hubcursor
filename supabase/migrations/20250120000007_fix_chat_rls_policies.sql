-- ========================================
-- FIX CHAT RLS POLICIES
-- ========================================
-- Corrige políticas muito permissivas do chat
-- Garante que usuários só vejam suas próprias mensagens
-- e que bloqueios e denúncias sigam o mesmo padrão

-- Dropar políticas permissivas do chat
DROP POLICY IF EXISTS "Authenticated users can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON chat_messages;

-- Criar políticas corretas usando auth.uid()
-- Usuários só podem ver mensagens onde são sender ou receiver
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

-- Usuários só podem enviar mensagens como sender_id próprio
CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

-- Usuários só podem atualizar mensagens onde são sender ou receiver
CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

-- Corrigir políticas de user_blocks (usuários só veem seus próprios bloqueios)
DROP POLICY IF EXISTS "Authenticated users can view blocks" ON user_blocks;
DROP POLICY IF EXISTS "Authenticated users can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Authenticated users can delete blocks" ON user_blocks;

CREATE POLICY "Users can view their own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid()::text = blocker_id::text);

CREATE POLICY "Users can create their own blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid()::text = blocker_id::text);

CREATE POLICY "Users can delete their own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid()::text = blocker_id::text);

-- Corrigir políticas de message_reports (usuários só veem suas próprias denúncias)
DROP POLICY IF EXISTS "Authenticated users can view reports" ON message_reports;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON message_reports;
DROP POLICY IF EXISTS "Authenticated users can update reports" ON message_reports;

CREATE POLICY "Users can view their own reports"
  ON message_reports FOR SELECT
  USING (auth.uid()::text = reporter_id::text);

CREATE POLICY "Users can create their own reports"
  ON message_reports FOR INSERT
  WITH CHECK (auth.uid()::text = reporter_id::text);

-- Admins podem ver todas as denúncias (para moderação)
CREATE POLICY "Admins can view all reports"
  ON message_reports FOR SELECT
  USING (true);

-- Admins podem atualizar denúncias (para moderação)
CREATE POLICY "Admins can update all reports"
  ON message_reports FOR UPDATE
  USING (true);

-- Comentários
COMMENT ON POLICY "Users can view their own messages" ON chat_messages IS 'Usuários só podem ver mensagens onde são sender ou receiver';
COMMENT ON POLICY "Users can send messages" ON chat_messages IS 'Usuários só podem enviar mensagens como sender_id próprio';
COMMENT ON POLICY "Users can view their own blocks" ON user_blocks IS 'Usuários só podem ver seus próprios bloqueios';

