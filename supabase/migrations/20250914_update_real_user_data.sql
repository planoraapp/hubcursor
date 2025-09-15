-- ========================================
-- ATUALIZAÇÃO DOS DADOS REAIS DOS USUÁRIOS
-- ========================================
-- Esta migração atualiza os dados dos usuários com informações reais da API do Habbo

-- 1. Atualizar dados do habbohub com informações reais
UPDATE public.habbo_accounts 
SET 
  habbo_id = 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  figure_string = 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  motto = 'HUB-QQ797',
  member_since = '2025-07-28T22:19:21.000+0000'::timestamp with time zone,
  current_level = 9,
  total_experience = 147,
  star_gem_count = 0,
  last_access_time = '2025-09-10T13:19:32.000+0000'::timestamp with time zone,
  updated_at = now()
WHERE habbo_name = 'habbohub' AND hotel = 'br';

-- 2. Atualizar dados do Beebop com informações reais
UPDATE public.habbo_accounts 
SET 
  habbo_id = 'hhbr-00e6988dddeb5a1838658c854d62fe49',
  figure_string = 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
  motto = 'HUB-ACTI1',
  member_since = '2006-06-20T16:57:34.000+0000'::timestamp with time zone,
  current_level = 28,
  total_experience = 2750,
  star_gem_count = 894,
  last_access_time = '2025-09-14T11:31:57.000+0000'::timestamp with time zone,
  updated_at = now()
WHERE habbo_name = 'Beebop' AND hotel = 'br';

-- 3. Adicionar colunas se não existirem (para compatibilidade)
DO $$ 
BEGIN
  -- Adicionar coluna current_level se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'habbo_accounts' AND column_name = 'current_level') THEN
    ALTER TABLE public.habbo_accounts ADD COLUMN current_level INTEGER DEFAULT 0;
  END IF;
  
  -- Adicionar coluna total_experience se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'habbo_accounts' AND column_name = 'total_experience') THEN
    ALTER TABLE public.habbo_accounts ADD COLUMN total_experience INTEGER DEFAULT 0;
  END IF;
  
  -- Adicionar coluna star_gem_count se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'habbo_accounts' AND column_name = 'star_gem_count') THEN
    ALTER TABLE public.habbo_accounts ADD COLUMN star_gem_count INTEGER DEFAULT 0;
  END IF;
  
  -- Adicionar coluna member_since se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'habbo_accounts' AND column_name = 'member_since') THEN
    ALTER TABLE public.habbo_accounts ADD COLUMN member_since TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
  
  -- Adicionar coluna last_access_time se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'habbo_accounts' AND column_name = 'last_access_time') THEN
    ALTER TABLE public.habbo_accounts ADD COLUMN last_access_time TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- 4. Criar usuário auth para Beebop se não existir
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
  '{"habbo_name": "Beebop", "habbo_id": "hhbr-00e6988dddeb5a1838658c854d62fe49"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- 5. Garantir que a conta do Beebop existe na tabela habbo_accounts
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  current_level,
  total_experience,
  star_gem_count,
  member_since,
  last_access_time,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'hhbr-00e6988dddeb5a1838658c854d62fe49',
  'Beebop',
  'hhbr-beebop-user-id-12345',
  'br',
  'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
  'HUB-ACTI1',
  true,
  28,
  2750,
  894,
  '2006-06-20T16:57:34.000+0000'::timestamp with time zone,
  '2025-09-14T11:31:57.000+0000'::timestamp with time zone,
  now(),
  now()
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  current_level = EXCLUDED.current_level,
  total_experience = EXCLUDED.total_experience,
  star_gem_count = EXCLUDED.star_gem_count,
  member_since = EXCLUDED.member_since,
  last_access_time = EXCLUDED.last_access_time,
  updated_at = now();

-- 6. Garantir que a conta do habbohub existe na tabela habbo_accounts
INSERT INTO public.habbo_accounts (
  id,
  habbo_id,
  habbo_name,
  supabase_user_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  current_level,
  total_experience,
  star_gem_count,
  member_since,
  last_access_time,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  'habbohub',
  (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
  'br',
  'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  'HUB-QQ797',
  true,
  9,
  147,
  0,
  '2025-07-28T22:19:21.000+0000'::timestamp with time zone,
  '2025-09-10T13:19:32.000+0000'::timestamp with time zone,
  now(),
  now()
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  current_level = EXCLUDED.current_level,
  total_experience = EXCLUDED.total_experience,
  star_gem_count = EXCLUDED.star_gem_count,
  member_since = EXCLUDED.member_since,
  last_access_time = EXCLUDED.last_access_time,
  updated_at = now();

-- 7. Comentário final
COMMENT ON TABLE public.habbo_accounts IS 'Dados atualizados com informações reais da API do Habbo em 14/09/2025';
