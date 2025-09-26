-- ========================================
-- ADICIONAR COLUNA LAST_ACCESS - EXECUTAR NO SUPABASE DASHBOARD
-- ========================================

-- Adicionar coluna last_access se não existir
ALTER TABLE public.habbo_accounts 
ADD COLUMN IF NOT EXISTS last_access timestamp with time zone DEFAULT now();

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'habbo_accounts' 
AND table_schema = 'public'
ORDER BY ordinal_position;
