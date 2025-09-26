-- ========================================
-- CRIAR CONTA HABBOHUB COM SENHA 151092
-- ========================================

-- Inserir usuário na tabela habbo_accounts
INSERT INTO public.habbo_accounts (
  id,
  habbo_name,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'habbohub',
  'br',
  'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
  'Sistema HabboHub - Administrador',
  true,
  false,
  now(),
  now()
) ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  is_admin = true,
  updated_at = now();

-- Verificar se a conta foi criada
SELECT 
  habbo_name,
  hotel,
  is_admin,
  created_at
FROM public.habbo_accounts 
WHERE habbo_name = 'habbohub' AND hotel = 'br';
