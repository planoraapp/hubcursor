
-- Limpeza completa dos dados de autenticação existentes (mantendo histórico do fórum)
-- Remover todas as contas habbo relacionadas ao Beebop
DELETE FROM user_stickers WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_layouts WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_backgrounds WHERE user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM user_home_ratings WHERE home_owner_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
) OR rating_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

DELETE FROM guestbook_entries WHERE home_owner_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
) OR author_user_id IN (
  SELECT supabase_user_id FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%'
);

-- Remover contas habbo (mas manter fórum que usa habbo_name como string)
DELETE FROM habbo_accounts WHERE habbo_name ILIKE '%beebop%';

-- Limpar dados de sessão antigos (users serão removidos automaticamente via cascade)
-- Nota: Os posts/comments do fórum serão mantidos pois usam habbo_name como string

-- Atualizar cor padrão do background para cinza-azulado do Habbo
UPDATE user_home_backgrounds 
SET background_value = '#c7d2dc' 
WHERE background_type = 'color' AND background_value = '#007bff';

-- Alterar valor padrão para novos usuários
ALTER TABLE user_home_backgrounds 
ALTER COLUMN background_value SET DEFAULT '#c7d2dc';
