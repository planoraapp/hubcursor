-- ========================================
-- SCRIPT DE LIMPEZA DE FUNÇÕES OBSOLETAS
-- Remove funções duplicadas e stubs vazios do banco
-- ========================================

-- ========================================
-- 1. IDENTIFICAR FUNÇÕES OBSOLETAS
-- ========================================

-- Listar todas as funções antes da limpeza
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_identity_arguments(p.oid) as identity_args,
  CASE 
    WHEN length(pg_get_functiondef(p.oid)) < 200 THEN 'Provavelmente stub/vazia'
    ELSE 'Implementada'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public')
  AND p.prokind = 'f'
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);

-- ========================================
-- 2. REMOVER FUNÇÕES OBSOLETAS
-- ========================================

-- 2.1. Remover process_affiliate_purchase() sem argumentos (stub vazio)
DROP FUNCTION IF EXISTS public.process_affiliate_purchase() CASCADE;

-- 2.2. Remover track_affiliate_visit() trigger vazio
DROP FUNCTION IF EXISTS public.track_affiliate_visit() CASCADE;

-- 2.3. Remover validate_coupon() sem argumentos (stub vazio)
DROP FUNCTION IF EXISTS public.validate_coupon() CASCADE;

-- 2.4. Remover validate_payment_session() vazia
DROP FUNCTION IF EXISTS public.validate_payment_session() CASCADE;

-- ========================================
-- 3. VERIFICAR FUNÇÕES APÓS LIMPEZA
-- ========================================

SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_identity_arguments(p.oid) as identity_args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public')
  AND p.prokind = 'f'
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);

-- ========================================
-- RESUMO DAS FUNÇÕES REMOVIDAS:
-- ========================================
-- 
-- 1. process_affiliate_purchase() - Função vazia sem argumentos
--    → Mantida: process_affiliate_purchase(affiliate_code text, purchase_amount numeric)
--
-- 2. track_affiliate_visit() - Trigger vazio
--    → Mantida: track_affiliate_visit(affiliate_code text)
--
-- 3. validate_coupon() - Função vazia sem argumentos
--    → Mantida: validate_coupon(coupon_code text)
--
-- 4. validate_payment_session() - Função vazia sem lógica útil
--
-- ========================================
-- FIM DO SCRIPT
-- ========================================

