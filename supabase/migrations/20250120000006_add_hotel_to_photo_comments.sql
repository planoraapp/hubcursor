-- ========================================
-- ADD HOTEL COLUMN TO PHOTO_COMMENTS
-- ========================================
-- Adiciona campo hotel para distinguir usuários com mesmo nome em hotéis diferentes

-- Adicionar coluna hotel (permitir NULL temporariamente para dados existentes)
ALTER TABLE photo_comments 
  ADD COLUMN IF NOT EXISTS hotel TEXT;

-- Atualizar comentários existentes: tentar inferir hotel do habbo_account se possível
-- (isso é uma aproximação, mas é melhor que nada)
UPDATE photo_comments pc
SET hotel = (
  SELECT COALESCE(ha.hotel, 'br')
  FROM habbo_accounts ha
  WHERE ha.user_id = pc.user_id
  LIMIT 1
)
WHERE hotel IS NULL;

-- Para comentários sem hotel associado, usar 'br' como padrão
UPDATE photo_comments
SET hotel = 'br'
WHERE hotel IS NULL;

-- Agora tornar NOT NULL
ALTER TABLE photo_comments
  ALTER COLUMN hotel SET NOT NULL,
  ALTER COLUMN hotel SET DEFAULT 'br';

-- Adicionar índice para queries por hotel (útil para filtros futuros)
CREATE INDEX IF NOT EXISTS photo_comments_hotel_idx ON photo_comments(hotel);

-- Comentário
COMMENT ON COLUMN photo_comments.hotel IS 'Código do hotel do usuário que fez o comentário (br, com, es, etc.)';

