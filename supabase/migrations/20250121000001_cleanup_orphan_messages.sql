-- ========================================
-- CLEANUP ORPHAN MESSAGES
-- ========================================
-- Marca como lidas todas as mensagens não lidas onde o sender não existe mais
-- Isso evita notificações de mensagens de usuários deletados

-- Marcar como lidas todas as mensagens não lidas de senders que não existem mais
UPDATE chat_messages cm
SET read_at = NOW()
WHERE cm.read_at IS NULL
AND NOT EXISTS (
  SELECT 1 
  FROM habbo_accounts ha 
  WHERE ha.supabase_user_id = cm.sender_id
);

-- Comentário
COMMENT ON TABLE chat_messages IS 'Mensagens de chat - mensagens de usuários deletados foram marcadas como lidas via migração 20250121000001';

