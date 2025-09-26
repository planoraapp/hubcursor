-- ========================================
-- CRIAÇÃO DE HOMES DE EXEMPLO PARA BEEBOP E HABBOHUB
-- ========================================
-- Esta migração cria dados de homes para os usuários Beebop e habbohub

-- 1. Criar home layout para Beebop
INSERT INTO public.user_home_layouts (
  id,
  user_id,
  widgets,
  stickers,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
  '[]'::jsonb,
  '[]'::jsonb,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  updated_at = now();

-- 2. Criar home background para Beebop
INSERT INTO public.user_home_backgrounds (
  id,
  user_id,
  background_type,
  background_value,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
  'image',
  'bghabbohub.png',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  updated_at = now();

-- 3. Criar home layout para habbohub
INSERT INTO public.user_home_layouts (
  id,
  user_id,
  widgets,
  stickers,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
  '[]'::jsonb,
  '[]'::jsonb,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  updated_at = now();

-- 4. Criar home background para habbohub
INSERT INTO public.user_home_backgrounds (
  id,
  user_id,
  background_type,
  background_value,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
  'image',
  'bghabbohub.png',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  updated_at = now();

-- 5. Criar algumas avaliações de exemplo para as homes
INSERT INTO public.user_home_ratings (
  id,
  home_owner_user_id,
  rater_user_id,
  rating,
  comment,
  created_at
) VALUES 
  -- Avaliações para Beebop
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    5,
    'Home incrível! Muito criativa!',
    now() - interval '2 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    4,
    'Muito boa organização!',
    now() - interval '1 day'
  ),
  -- Avaliações para habbohub
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    5,
    'Home perfeita para o projeto!',
    now() - interval '3 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    5,
    'Design muito profissional!',
    now() - interval '1 day'
  );

-- 6. Criar tabela user_home_visits se não existir
CREATE TABLE IF NOT EXISTS public.user_home_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_owner_user_id uuid REFERENCES auth.users NOT NULL,
  visitor_user_id uuid REFERENCES auth.users,
  visited_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de visitas
ALTER TABLE public.user_home_visits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_home_visits
CREATE POLICY IF NOT EXISTS "Public can view visits" 
  ON public.user_home_visits 
  FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can add visits" 
  ON public.user_home_visits 
  FOR INSERT 
  WITH CHECK (true);

-- 7. Criar dados de visitas para as homes
INSERT INTO public.user_home_visits (
  id,
  home_owner_user_id,
  visitor_user_id,
  visited_at
) VALUES 
  -- Visitas para Beebop
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    now() - interval '1 hour'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    now() - interval '2 hours'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    now() - interval '1 day'
  ),
  -- Visitas para habbohub
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    now() - interval '30 minutes'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    now() - interval '1 hour'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
    now() - interval '2 days'
  );

-- 7. Comentário final
COMMENT ON TABLE public.user_home_layouts IS 'Dados de homes criados para Beebop e habbohub em 14/09/2025';
