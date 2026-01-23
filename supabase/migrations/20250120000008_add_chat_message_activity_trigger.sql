-- ========================================
-- TRIGGER PARA LOGAR MENSAGENS DE CHAT
-- ========================================
-- Registra automaticamente mensagens de chat no user_activity_log
-- quando uma nova mensagem é inserida

-- Função para registrar atividades de chat
CREATE OR REPLACE FUNCTION log_chat_message_activity()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Buscar habbo_name do sender através de habbo_accounts
  SELECT habbo_name INTO sender_name
  FROM habbo_accounts
  WHERE supabase_user_id = NEW.sender_id
  LIMIT 1;

  -- Se não encontrar, usar 'unknown' (não deve acontecer, mas previne erro)
  sender_name := COALESCE(sender_name, 'unknown');

  -- Registrar atividade no log
  INSERT INTO user_activity_log (
    user_id, 
    habbo_name, 
    activity_type, 
    target_type, 
    target_id, 
    metadata
  )
  VALUES (
    NEW.sender_id,
    sender_name,
    'chat_message',
    'chat',
    NEW.receiver_id::text,
    jsonb_build_object(
      'message_id', NEW.id,
      'message_preview', left(NEW.message, 50), -- Primeiros 50 caracteres
      'receiver_id', NEW.receiver_id,
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger (só para INSERT, pois mensagens não são deletadas, apenas marcadas)
CREATE TRIGGER chat_messages_activity_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION log_chat_message_activity();

-- Comentários
COMMENT ON FUNCTION log_chat_message_activity() IS 'Registra automaticamente atividades de mensagens de chat no user_activity_log';
COMMENT ON TRIGGER chat_messages_activity_trigger ON chat_messages IS 'Trigger que registra cada nova mensagem de chat no log de atividades';

