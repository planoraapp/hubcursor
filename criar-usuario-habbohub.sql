-- Criar usuário habbohub na tabela hub_users
INSERT INTO public.hub_users (
  id,
  habbo_username,
  hotel,
  habbo_avatar,
  password_hash,
  member_since,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'habbohub',
  'br',
  'https://www.habbo.com.br/habbo-imaging/avatarimage?user=habbohub&headonly=1',
  '131c6442c7c71876b2b4b8043d96f6b76d2608316172f26bb0affc4b994d089d',
  '2024-01-01',
  true,
  NOW(),
  NOW()
) ON CONFLICT (habbo_username, hotel) DO UPDATE SET
  habbo_avatar = EXCLUDED.habbo_avatar,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Verificar se foi criado
SELECT * FROM public.hub_users WHERE habbo_username = 'habbohub';
