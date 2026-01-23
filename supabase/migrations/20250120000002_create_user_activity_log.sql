-- ========================================
-- CREATE USER_ACTIVITY_LOG TABLE
-- ========================================
-- Tabela para registrar todas as interações dos usuários
-- Permite análise de comportamento, histórico e feedback

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'photo_like',
    'photo_unlike',
    'photo_comment',
    'photo_comment_delete',
    'chat_message',
    'profile_view',
    'profile_follow',
    'profile_unfollow'
  )),
  target_type TEXT, -- 'photo', 'user', 'chat', etc.
  target_id TEXT, -- ID do recurso alvo (photo_id, user_id, etc.)
  metadata JSONB, -- Dados adicionais flexíveis (ex: comment_text, room_id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS user_activity_log_user_id_idx ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS user_activity_log_activity_type_idx ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS user_activity_log_target_idx ON user_activity_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS user_activity_log_created_at_idx ON user_activity_log(created_at DESC);
-- Índice composto para histórico de usuário por tipo
CREATE INDEX IF NOT EXISTS user_activity_log_user_type_idx ON user_activity_log(user_id, activity_type, created_at DESC);

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Usuários podem ver apenas suas próprias atividades (privacidade)
CREATE POLICY "Users can view their own activities" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Apenas o sistema pode inserir atividades (via triggers ou edge functions)
CREATE POLICY "System can insert activities" ON user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE user_activity_log IS 'Log de todas as atividades dos usuários para análise e histórico';
COMMENT ON COLUMN user_activity_log.activity_type IS 'Tipo de atividade (photo_like, photo_comment, chat_message, etc.)';
COMMENT ON COLUMN user_activity_log.metadata IS 'Dados adicionais em formato JSON (comment_text, room_id, etc.)';

