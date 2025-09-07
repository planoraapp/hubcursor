-- Verificar se o usuário habbohub existe na tabela hub_users
SELECT 
    id,
    habbo_username,
    hotel,
    habbo_avatar,
    is_active,
    created_at,
    updated_at
FROM public.hub_users 
WHERE habbo_username = 'habbohub';

-- Se não existir, criar o usuário habbohub
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

-- Verificar se foi criado/atualizado
SELECT 
    id,
    habbo_username,
    hotel,
    habbo_avatar,
    is_active,
    created_at,
    updated_at
FROM public.hub_users 
WHERE habbo_username = 'habbohub';

-- Verificar se existem dados de home para habbohub
SELECT 
    'user_home_backgrounds' as tabela,
    COUNT(*) as registros
FROM public.user_home_backgrounds uhb
JOIN public.hub_users hu ON uhb.user_id = hu.id
WHERE hu.habbo_username = 'habbohub'

UNION ALL

SELECT 
    'user_home_widgets' as tabela,
    COUNT(*) as registros
FROM public.user_home_widgets uhw
JOIN public.hub_users hu ON uhw.user_id = hu.id
WHERE hu.habbo_username = 'habbohub'

UNION ALL

SELECT 
    'user_stickers' as tabela,
    COUNT(*) as registros
FROM public.user_stickers us
JOIN public.hub_users hu ON us.user_id = hu.id
WHERE hu.habbo_username = 'habbohub';
