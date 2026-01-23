-- ========================================
-- TRIGGERS PARA REGISTRAR ATIVIDADES AUTOMATICAMENTE
-- ========================================
-- Estas funções e triggers registram automaticamente as atividades
-- quando likes/comentários são criados ou deletados

-- Função unificada para registrar atividades de like/unlike
CREATE OR REPLACE FUNCTION log_photo_like_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, habbo_name, activity_type, target_type, target_id)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.habbo_name, OLD.habbo_name),
    CASE WHEN TG_OP = 'INSERT' THEN 'photo_like' ELSE 'photo_unlike' END,
    'photo',
    COALESCE(NEW.photo_id, OLD.photo_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para photo_likes
CREATE TRIGGER photo_likes_activity_trigger
  AFTER INSERT OR DELETE ON photo_likes
  FOR EACH ROW
  EXECUTE FUNCTION log_photo_like_activity();

-- Função unificada para registrar atividades de comentários
CREATE OR REPLACE FUNCTION log_photo_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, habbo_name, activity_type, target_type, target_id, metadata)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.habbo_name, OLD.habbo_name),
    CASE WHEN TG_OP = 'INSERT' THEN 'photo_comment' ELSE 'photo_comment_delete' END,
    'photo',
    COALESCE(NEW.photo_id, OLD.photo_id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('comment_text', NEW.comment_text, 'comment_id', NEW.id)
      ELSE jsonb_build_object('comment_id', OLD.id)
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para photo_comments
CREATE TRIGGER photo_comments_activity_trigger
  AFTER INSERT OR DELETE ON photo_comments
  FOR EACH ROW
  EXECUTE FUNCTION log_photo_comment_activity();

-- Comentários
COMMENT ON FUNCTION log_photo_like_activity() IS 'Registra automaticamente atividades de like/unlike';
COMMENT ON FUNCTION log_photo_comment_activity() IS 'Registra automaticamente atividades de comentários';

