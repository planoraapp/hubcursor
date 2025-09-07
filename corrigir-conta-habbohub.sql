-- Deletar conta habbohub existente e recriar com senha correta
DELETE FROM public.hub_users WHERE habbo_username = 'habbohub' AND hotel = 'br';

-- Recriar conta com hash correto da senha 151092
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
  '131c6442c7c71876b2b4b8043d96f6b76d2608316172f26bb0affc4b994d089d', -- hash correto da senha '151092'
  '2024-01-01',
  NOW(),
  TRUE
);

-- Verificar se foi criada corretamente
SELECT 
  habbo_username, 
  hotel, 
  password_hash, 
  is_active,
  created_at
FROM public.hub_users 
WHERE habbo_username = 'habbohub' AND hotel = 'br';
