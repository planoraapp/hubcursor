-- Dropar tabelas existentes se houver (para recriar limpo)
DROP TABLE IF EXISTS message_reports CASCADE;
DROP TABLE IF EXISTS user_blocks CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Tabela de mensagens do chat
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_receiver BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE
);

-- Tabela de bloqueios entre usuários
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Tabela de denúncias de mensagens
CREATE TABLE message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  admin_notes TEXT
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON message_reports(status);

-- Habilitar Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_messages
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

DROP POLICY IF EXISTS "Users can update their messages" ON chat_messages;
CREATE POLICY "Users can update their messages"
  ON chat_messages FOR UPDATE
  USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

-- Políticas para user_blocks
DROP POLICY IF EXISTS "Users can view their blocks" ON user_blocks;
CREATE POLICY "Users can view their blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid()::text = blocker_id::text);

DROP POLICY IF EXISTS "Users can create blocks" ON user_blocks;
CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid()::text = blocker_id::text);

DROP POLICY IF EXISTS "Users can delete blocks" ON user_blocks;
CREATE POLICY "Users can delete blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid()::text = blocker_id::text);

-- Políticas para message_reports
DROP POLICY IF EXISTS "Users can view their reports" ON message_reports;
CREATE POLICY "Users can view their reports"
  ON message_reports FOR SELECT
  USING (auth.uid()::text = reporter_id::text);

DROP POLICY IF EXISTS "Users can create reports" ON message_reports;
CREATE POLICY "Users can create reports"
  ON message_reports FOR INSERT
  WITH CHECK (auth.uid()::text = reporter_id::text);

DROP POLICY IF EXISTS "Admins can view all reports" ON message_reports;
CREATE POLICY "Admins can view all reports"
  ON message_reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update reports" ON message_reports;
CREATE POLICY "Admins can update reports"
  ON message_reports FOR UPDATE
  USING (true);
