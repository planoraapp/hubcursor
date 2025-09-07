-- Criar conta habbohub diretamente no banco
-- Primeiro, vamos verificar se já existe
SELECT * FROM public.hub_users WHERE habbo_username = 'habbohub' AND hotel = 'br';

-- Se não existir, criar a conta
INSERT INTO public.hub_users (
  habbo_username,
  hotel,
  habbo_avatar,
  password_hash,
  member_since,
  created_at,
  is_active
) VALUES (
  'habbohub',
  'br',
  'https://www.habbo.com.br/habbo-imaging/avatarimage?user=habbohub&headonly=1',
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', -- hash da senha '151092'
  '2024-01-01',
  NOW(),
  TRUE
) ON CONFLICT (habbo_username, hotel) DO UPDATE SET
  habbo_avatar = EXCLUDED.habbo_avatar,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Verificar se foi criada
SELECT * FROM public.hub_users WHERE habbo_username = 'habbohub' AND hotel = 'br';
