
-- Criar um usuário auth para Beebop
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
  'hhbr-beebop-user-id-12345',
  'hhbr-beebop@habbohub.com',
  crypt('290684', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"habbo_name": "Beebop"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Criar a conta Habbo para Beebop
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  is_admin,
  created_at
) VALUES (
  gen_random_uuid(),
  'hhbr-beebop',
  'Beebop',
  'hhbr-beebop-user-id-12345',
  true,
  now()
) ON CONFLICT (habbo_name) DO NOTHING;
