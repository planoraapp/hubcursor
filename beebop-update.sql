-- Script SQL para atualizar dados do Beebop com informações reais da API
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Atualizar dados do Beebop com informações reais da API do Habbo
UPDATE habbo_accounts 
SET 
  figure_string = 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
  motto = 'HUB-ACTI1',
  habbo_id = 'hhbr-00e6988dddeb5a1838658c854d62fe49',
  updated_at = NOW()
WHERE habbo_name = 'Beebop' AND is_admin = true;

-- 2. Verificar se a atualização foi bem-sucedida
SELECT 
  id,
  habbo_name,
  figure_string,
  motto,
  habbo_id,
  hotel,
  is_admin,
  updated_at
FROM habbo_accounts 
WHERE habbo_name = 'Beebop';

-- 3. Criar usuário auth para o Beebop (se não existir)
-- Nota: Este comando pode precisar ser executado manualmente no Supabase Dashboard > Authentication
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_user_meta_data
-- ) VALUES (
--   '9f4ff5bd-f57f-4b52-93c8-3fc4e6382e28',
--   'hhbr-beebop@habbohub.com',
--   crypt('290684', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"habbo_name": "Beebop", "hotel": "br"}'::jsonb
-- ) ON CONFLICT (id) DO NOTHING;

-- 4. Verificar se existe home layout para o Beebop
SELECT 
  uhl.id,
  uhl.user_id,
  uhl.widgets,
  uhl.stickers,
  uhl.created_at,
  uhl.updated_at
FROM user_home_layouts uhl
JOIN habbo_accounts ha ON uhl.user_id = ha.supabase_user_id
WHERE ha.habbo_name = 'Beebop';

-- 5. Verificar se existe home background para o Beebop
SELECT 
  uhb.id,
  uhb.user_id,
  uhb.background_type,
  uhb.background_value,
  uhb.created_at,
  uhb.updated_at
FROM user_home_backgrounds uhb
JOIN habbo_accounts ha ON uhb.user_id = ha.supabase_user_id
WHERE ha.habbo_name = 'Beebop';

-- 6. Comentário final
COMMENT ON TABLE habbo_accounts IS 'Dados do Beebop atualizados em 14/09/2025 com informações reais da API do Habbo';
