-- Script para verificar e corrigir duplicatas do Beebop
-- Executar no Supabase SQL Editor

-- 1. Verificar registros do Beebop
SELECT 
    id,
    habbo_name,
    hotel,
    habbo_id,
    supabase_user_id,
    created_at,
    updated_at,
    is_admin,
    is_online
FROM habbo_accounts 
WHERE habbo_name ILIKE '%Beebop%' 
ORDER BY created_at;

-- 2. Verificar se há registros com hotel 'ptbr' (incorreto)
SELECT COUNT(*) as count_ptbr
FROM habbo_accounts 
WHERE habbo_name ILIKE '%Beebop%' AND hotel = 'ptbr';

-- 3. Verificar se há registros com hotel 'br' (correto)
SELECT COUNT(*) as count_br
FROM habbo_accounts 
WHERE habbo_name ILIKE '%Beebop%' AND hotel = 'br';

-- 4. Se houver registros com hotel 'ptbr', corrigir para 'br'
-- (Descomente as linhas abaixo se necessário)
/*
UPDATE habbo_accounts 
SET hotel = 'br' 
WHERE habbo_name ILIKE '%Beebop%' AND hotel = 'ptbr';
*/

-- 5. Verificar se há múltiplos registros com mesmo nome mas hotéis diferentes
SELECT 
    habbo_name,
    COUNT(DISTINCT hotel) as hotel_count,
    STRING_AGG(DISTINCT hotel, ', ') as hotels
FROM habbo_accounts 
WHERE habbo_name ILIKE '%Beebop%'
GROUP BY habbo_name
HAVING COUNT(DISTINCT hotel) > 1;
