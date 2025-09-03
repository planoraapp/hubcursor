
-- Limpeza completa do usuário Beebop
-- Remove todos os registros de Beebop da tabela habbo_accounts
DELETE FROM public.habbo_accounts 
WHERE habbo_name ILIKE 'beebop';

-- Verificar se a limpeza foi bem-sucedida
SELECT COUNT(*) as registros_restantes 
FROM public.habbo_accounts 
WHERE habbo_name ILIKE 'beebop';
