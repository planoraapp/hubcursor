
-- Limpar todos os dados de usuários e contas relacionadas
DELETE FROM photo_comments;
DELETE FROM photo_likes;
DELETE FROM user_followers;
DELETE FROM guestbook_entries;
DELETE FROM user_home_ratings;
DELETE FROM user_stickers;
DELETE FROM user_home_layouts;
DELETE FROM user_home_backgrounds;
DELETE FROM habbo_accounts;

-- Criar conta única para Beebop com ID fixo
-- Nota: O auth.users precisa ser limpo manualmente via interface do Supabase
-- Após limpar, criaremos a conta Beebop programaticamente

-- Garantir que a tabela user_stickers está otimizada
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'decorative';
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0;
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS scale DECIMAL(3,2) DEFAULT 1.0;

-- Criar alguns stickers padrão se necessário
INSERT INTO user_stickers (user_id, sticker_id, sticker_src, category, x, y, z_index) VALUES
('00000000-0000-0000-0000-000000000000', 'heart_1', '/assets/home/stickers/emoticons/heart.png', 'emoticons', 0, 0, 1),
('00000000-0000-0000-0000-000000000000', 'star_1', '/assets/home/stickers/decorative/star.png', 'decorative', 0, 0, 1),
('00000000-0000-0000-0000-000000000000', 'text_1', '/assets/home/stickers/text/hello.png', 'text', 0, 0, 1)
ON CONFLICT DO NOTHING;
