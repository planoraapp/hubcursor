
-- Limpar contas auth órfãs do usuário Beebop
DELETE FROM auth.users 
WHERE email LIKE '%@habbohub.com' 
AND raw_user_meta_data->>'habbo_name' ILIKE 'beebop'
AND id NOT IN (
  SELECT supabase_user_id 
  FROM public.habbo_accounts 
  WHERE supabase_user_id IS NOT NULL
);

-- Limpar também possíveis registros de identidades órfãs
DELETE FROM auth.identities 
WHERE user_id NOT IN (SELECT id FROM auth.users);
