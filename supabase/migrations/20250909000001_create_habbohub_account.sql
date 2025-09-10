-- ========================================
-- CRIAR CONTA HABBOHUB COM SENHA 151092
-- ========================================

-- Criar um usuário auth para habbohub
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

-- Criar a conta Habbo para habbohub
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
  'hhbr-habbohub-system',
  'habbohub',
  'hhbr-habbohub-user-id-12345',
  'br',
  'hd-180-1.ch-255-66.lg-285-80.sh-290-62.ha-1012-110.hr-831-49',
  'Sistema HabboHub - Administrador',
  true,
  false,
  now()
) ON CONFLICT (habbo_name, hotel) DO NOTHING;