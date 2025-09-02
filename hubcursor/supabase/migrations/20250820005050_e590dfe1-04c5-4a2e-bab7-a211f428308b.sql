-- Limpeza completa das contas existentes (preservando apenas Beebop)

-- 1. Primeiro, vamos identificar o user_id do Beebop
DO $$
DECLARE
    beebop_user_id uuid;
BEGIN
    -- Buscar o user_id do Beebop
    SELECT supabase_user_id INTO beebop_user_id 
    FROM public.habbo_accounts 
    WHERE lower(habbo_name) = 'beebop' 
    LIMIT 1;

    -- Log para debug
    RAISE NOTICE 'Beebop user_id: %', beebop_user_id;

    -- 2. Limpar dados relacionados nas tabelas (preservando Beebop)
    
    -- User stickers
    DELETE FROM public.user_stickers 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home ratings
    DELETE FROM public.user_home_ratings 
    WHERE (home_owner_user_id != beebop_user_id AND rating_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User home widgets
    DELETE FROM public.user_home_widgets 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home layouts
    DELETE FROM public.user_home_layouts 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- User home backgrounds
    DELETE FROM public.user_home_backgrounds 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Guestbook entries
    DELETE FROM public.guestbook_entries 
    WHERE (home_owner_user_id != beebop_user_id AND author_user_id != beebop_user_id) 
    OR beebop_user_id IS NULL;
    
    -- User followers
    DELETE FROM public.user_followers 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo comments
    DELETE FROM public.photo_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Photo likes
    DELETE FROM public.photo_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile comments
    DELETE FROM public.console_profile_comments 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile follows
    DELETE FROM public.console_profile_follows 
    WHERE follower_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Console profile likes
    DELETE FROM public.console_profile_likes 
    WHERE user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum posts
    DELETE FROM public.forum_posts 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;
    
    -- Forum comments
    DELETE FROM public.forum_comments 
    WHERE author_supabase_user_id != beebop_user_id OR beebop_user_id IS NULL;

    -- 3. Deletar contas Habbo (preservando Beebop)
    DELETE FROM public.habbo_accounts 
    WHERE lower(habbo_name) != 'beebop';

    -- 4. Log final
    RAISE NOTICE 'Limpeza concluída. Contas preservadas: %', 
        (SELECT COUNT(*) FROM public.habbo_accounts);
    
END $$;