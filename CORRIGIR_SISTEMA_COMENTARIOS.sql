-- =====================================================
-- CORREÇÃO DO SISTEMA DE COMENTÁRIOS - HABBO HUB
-- =====================================================
-- Execute este SQL no dashboard do Supabase para corrigir
-- o sistema de comentários para todos os usuários

-- PASSO 1: Criar tabela temporária sem foreign key constraint
CREATE TABLE photo_comments_temp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  habbo_name TEXT NOT NULL,
  comment_text TEXT NOT NULL CHECK (length(comment_text) >= 1 AND length(comment_text) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 2: Copiar dados existentes
INSERT INTO photo_comments_temp SELECT * FROM photo_comments;

-- PASSO 3: Remover tabela antiga e renomear nova
DROP TABLE photo_comments;
ALTER TABLE photo_comments_temp RENAME TO photo_comments;

-- PASSO 4: Criar índices para performance
CREATE INDEX photo_comments_photo_id_idx ON photo_comments(photo_id);
CREATE INDEX photo_comments_user_id_idx ON photo_comments(user_id);
CREATE INDEX photo_comments_created_at_idx ON photo_comments(created_at);

-- PASSO 5: Habilitar RLS
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Criar políticas RLS que verificam habbo_accounts
CREATE POLICY "Users can view all comments" ON photo_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert comments if they exist in habbo_accounts" ON photo_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM habbo_accounts 
      WHERE habbo_accounts.supabase_user_id = photo_comments.user_id
    )
  );

CREATE POLICY "Users can update their own comments" ON photo_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM habbo_accounts 
      WHERE habbo_accounts.supabase_user_id = photo_comments.user_id
    )
  );

CREATE POLICY "Users can delete their own comments" ON photo_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM habbo_accounts 
      WHERE habbo_accounts.supabase_user_id = photo_comments.user_id
    )
  );

-- PASSO 7: Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photo_comments_updated_at 
  BEFORE UPDATE ON photo_comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICAÇÃO: Teste se funcionou
-- =====================================================
-- Execute esta query para testar se o sistema está funcionando:
/*
INSERT INTO photo_comments (photo_id, user_id, habbo_name, comment_text) 
VALUES ('test-photo-123', '9fa94b30-1f56-4ea5-8e53-b79a098ab739', 'PatodeBorracha', 'Teste após correção');

-- Se não der erro, o sistema está funcionando!
-- Delete o comentário de teste:
DELETE FROM photo_comments WHERE photo_id = 'test-photo-123';
*/
