-- ========================================
-- MATERIALIZED VIEW PARA ESTATÍSTICAS AGREGADAS
-- ========================================
-- View materializada para estatísticas do admin dashboard
-- Atualizada periodicamente para melhor performance

CREATE MATERIALIZED VIEW IF NOT EXISTS admin_stats AS
SELECT 
  -- Estatísticas de usuários
  (SELECT COUNT(*) FROM habbo_accounts) as total_users,
  (SELECT COUNT(*) FROM habbo_accounts WHERE is_online = true) as active_users,
  
  -- Estatísticas de fotos
  (SELECT COUNT(*) FROM photo_likes) as total_photo_likes,
  (SELECT COUNT(*) FROM photo_comments) as total_photo_comments,
  (SELECT COUNT(DISTINCT photo_id) FROM photo_likes) as unique_photos_with_likes,
  (SELECT COUNT(DISTINCT photo_id) FROM photo_comments) as unique_photos_with_comments,
  
  -- Estatísticas de homes
  (SELECT COUNT(*) FROM user_home_backgrounds) as total_homes,
  (SELECT COUNT(*) FROM user_home_widgets) as total_widgets,
  (SELECT COUNT(*) FROM user_stickers) as total_stickers,
  (SELECT COUNT(*) FROM user_home_ratings) as total_home_ratings,
  (SELECT COALESCE(AVG(rating), 0) FROM user_home_ratings) as average_home_rating,
  
  -- Estatísticas de guestbook
  (SELECT COUNT(*) FROM guestbook_entries) as total_guestbook_entries,
  
  -- Estatísticas de atividades recentes (últimas 24h)
  (SELECT COUNT(*) FROM user_activity_log 
   WHERE created_at > NOW() - INTERVAL '24 hours' 
   AND activity_type IN ('photo_like', 'photo_comment')) as interactions_last_24h,
  
  -- Timestamp da última atualização
  NOW() as last_updated
WITH NO DATA;

-- Criar índice único para garantir que sempre haverá apenas uma linha
CREATE UNIQUE INDEX IF NOT EXISTS admin_stats_single_row_idx ON admin_stats ((1));

-- Função para atualizar a materialized view
CREATE OR REPLACE FUNCTION refresh_admin_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_stats;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON MATERIALIZED VIEW admin_stats IS 'Estatísticas agregadas para o admin dashboard';
COMMENT ON FUNCTION refresh_admin_stats() IS 'Atualiza as estatísticas do admin dashboard';

-- NOTA: Esta view deve ser atualizada periodicamente via cron job ou edge function
-- Exemplo de cron (executar a cada 5 minutos):
-- SELECT cron.schedule('refresh-admin-stats', '*/5 * * * *', 'SELECT refresh_admin_stats();');

