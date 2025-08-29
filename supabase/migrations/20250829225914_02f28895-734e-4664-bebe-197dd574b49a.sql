-- Criar conta Beebop diretamente
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'hhbr-beebop@habbohub.com',
  crypt('290684', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Inserir dados da conta Habbo para Beebop
INSERT INTO public.habbo_accounts (
  supabase_user_id,
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_online,
  is_admin
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com'),
  'Beebop',
  'hhbr-beebop',
  'br',
  'hd-180-1.ch-210-66.lg-270-82.sh-290-81.ha-1002-70.hr-828-61',
  'HabboHub Admin - Desenvolvedor',
  true,
  true
) ON CONFLICT (supabase_user_id) DO UPDATE SET
  habbo_name = EXCLUDED.habbo_name,
  habbo_id = EXCLUDED.habbo_id,
  hotel = EXCLUDED.hotel,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  is_admin = EXCLUDED.is_admin;