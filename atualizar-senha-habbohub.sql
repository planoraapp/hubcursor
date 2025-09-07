-- Atualizar senha da conta habbohub com hash correto
UPDATE public.hub_users 
SET 
  password_hash = '131c6442c7c71876b2b4b8043d96f6b76d2608316172f26bb0affc4b994d089d',
  updated_at = NOW()
WHERE habbo_username = 'habbohub' AND hotel = 'br';

-- Verificar se foi atualizada
SELECT habbo_username, hotel, password_hash, updated_at 
FROM public.hub_users 
WHERE habbo_username = 'habbohub' AND hotel = 'br';
