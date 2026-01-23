-- ========================================
-- OTIMIZAÇÕES ADICIONAIS PARA PHOTO_COMMENTS
-- ========================================
-- Adiciona índices compostos que faltam para melhorar performance

-- Índice composto para verificar comentários de um usuário em uma foto específica
CREATE INDEX IF NOT EXISTS photo_comments_photo_user_idx ON photo_comments(photo_id, user_id);

-- Índice composto para ordenação por data (já temos created_at, mas este é mais específico)
CREATE INDEX IF NOT EXISTS photo_comments_photo_created_idx ON photo_comments(photo_id, created_at ASC);

-- Comentário
COMMENT ON INDEX photo_comments_photo_user_idx IS 'Índice para queries que verificam comentários de um usuário em uma foto';
COMMENT ON INDEX photo_comments_photo_created_idx IS 'Índice otimizado para ordenação de comentários por foto e data';

