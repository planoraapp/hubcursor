-- Script para adicionar comentários de boas-vindas do habbohub em homes com comentários antigos
-- Executar no Supabase SQL Editor

-- 1. Verificar homes que têm comentários antigos (sem regionalização)
WITH homes_with_old_comments AS (
  SELECT DISTINCT 
    g.home_owner_user_id,
    h.habbo_name,
    h.hotel
  FROM guestbook_entries g
  JOIN habbo_accounts h ON g.home_owner_user_id = h.supabase_user_id
  WHERE g.created_at < '2025-01-01' -- Comentários antigos
    OR g.author_habbo_name NOT LIKE '%-%' -- Sem regionalização
    OR g.author_habbo_name = 'habbohub' -- Comentários antigos do habbohub
),
homes_without_welcome AS (
  SELECT hwc.home_owner_user_id, hwc.habbo_name, hwc.hotel
  FROM homes_with_old_comments hwc
  WHERE NOT EXISTS (
    SELECT 1 FROM guestbook_entries g2 
    WHERE g2.home_owner_user_id = hwc.home_owner_user_id
      AND g2.author_habbo_name = 'habbohub'
      AND g2.message LIKE '%Bem-vindo%'
  )
)
SELECT 
  'INSERT INTO guestbook_entries (home_owner_user_id, author_user_id, author_habbo_name, message, moderation_status, created_at, updated_at) VALUES' ||
  string_agg(
    format(
      '(%L, NULL, %L, %L, %L, %L, %L)',
      home_owner_user_id,
      'habbohub',
      format('Olá %s! 🎉 Bem-vindo(a) ao HabboHub! Esta é sua nova home. Divirta-se personalizando e explorando!', habbo_name),
      'approved',
      now()::text,
      now()::text
    ),
    ','
  ) || ';' as insert_statement
FROM homes_without_welcome;

-- 2. Se quiser executar os inserts diretamente (descomente as linhas abaixo):
/*
INSERT INTO guestbook_entries (home_owner_user_id, author_user_id, author_habbo_name, message, moderation_status, created_at, updated_at)
SELECT 
  hwc.home_owner_user_id,
  NULL,
  'habbohub',
  format('Olá %s! 🎉 Bem-vindo(a) ao HabboHub! Esta é sua nova home. Divirta-se personalizando e explorando!', hwc.habbo_name),
  'approved',
  now(),
  now()
FROM homes_with_old_comments hwc
WHERE NOT EXISTS (
  SELECT 1 FROM guestbook_entries g2 
  WHERE g2.home_owner_user_id = hwc.home_owner_user_id
    AND g2.author_habbo_name = 'habbohub'
    AND g2.message LIKE '%Bem-vindo%'
);
*/

-- 3. Verificar quantos comentários de boas-vindas foram adicionados
SELECT 
  COUNT(*) as total_welcome_comments,
  COUNT(DISTINCT home_owner_user_id) as unique_homes
FROM guestbook_entries 
WHERE author_habbo_name = 'habbohub' 
  AND message LIKE '%Bem-vindo%';
