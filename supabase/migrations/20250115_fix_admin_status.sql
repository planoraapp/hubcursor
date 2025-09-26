-- ========================================
-- CORRIGIR STATUS DE ADMIN
-- Apenas habbohub deve ser admin
-- ========================================

-- 1. Remover status de admin do Beebop
UPDATE public.habbo_accounts 
SET is_admin = false 
WHERE habbo_name = 'Beebop' AND hotel = 'br';

-- 2. Garantir que habbohub seja admin
UPDATE public.habbo_accounts 
SET is_admin = true 
WHERE habbo_name = 'habbohub' AND hotel = 'br';

-- 3. Verificar resultado
SELECT 
  habbo_name,
  hotel,
  is_admin,
  created_at
FROM public.habbo_accounts 
WHERE habbo_name IN ('Beebop', 'habbohub')
ORDER BY habbo_name;
