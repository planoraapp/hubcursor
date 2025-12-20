-- ========================================
-- CREATE PHOTO_LIKES TABLE
-- ========================================
-- Esta migration cria a tabela photo_likes com todas as constraints
-- e índices necessários para performance e integridade dos dados

CREATE TABLE IF NOT EXISTS photo_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint UNIQUE para evitar likes duplicados
-- Um usuário só pode curtir uma foto uma vez
ALTER TABLE photo_likes 
  ADD CONSTRAINT photo_likes_user_photo_unique 
  UNIQUE (photo_id, user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS photo_likes_photo_id_idx ON photo_likes(photo_id);
CREATE INDEX IF NOT EXISTS photo_likes_user_id_idx ON photo_likes(user_id);
CREATE INDEX IF NOT EXISTS photo_likes_created_at_idx ON photo_likes(created_at DESC);
-- Índice composto para queries comuns (verificar se usuário curtiu foto)
CREATE INDEX IF NOT EXISTS photo_likes_photo_user_idx ON photo_likes(photo_id, user_id);

-- Enable RLS
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all likes" ON photo_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own likes" ON photo_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON photo_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE photo_likes IS 'Armazena os likes dados pelos usuários nas fotos';
COMMENT ON COLUMN photo_likes.photo_id IS 'ID da foto (formato pode variar - texto flexível)';
COMMENT ON COLUMN photo_likes.user_id IS 'ID do usuário autenticado (referência a auth.users)';
COMMENT ON COLUMN photo_likes.habbo_name IS 'Nome do Habbo do usuário (para exibição rápida sem join)';
COMMENT ON CONSTRAINT photo_likes_user_photo_unique ON photo_likes IS 'Garante que um usuário só pode curtir uma foto uma vez';

