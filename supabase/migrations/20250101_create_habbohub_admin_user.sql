-- ========================================
-- CRIAR USUÁRIO ADMIN HABBOHUB
-- Seguindo o mesmo padrão do Beebop
-- ========================================

-- 1. Criar usuário auth para habbohub
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'hhbr-habbohub-user-id-12345',
  'hhbr-habbohub@habbohub.com',
  crypt('151092', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"habbo_name": "habbohub"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar a conta Habbo para habbohub
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  created_at
) VALUES (
  gen_random_uuid(),
  'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  'habbohub',
  'hhbr-habbohub-user-id-12345',
  'br',
  'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  'HUB-QQ797',
  true,
  false,
  now()
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  is_admin = EXCLUDED.is_admin,
  updated_at = now();

-- 3. Verificar se foi criado corretamente
SELECT 
  ha.habbo_name,
  ha.habbo_id,
  ha.hotel,
  ha.is_admin,
  au.email
FROM public.habbo_accounts ha
JOIN auth.users au ON ha.supabase_user_id = au.id
WHERE ha.habbo_name = 'habbohub';
