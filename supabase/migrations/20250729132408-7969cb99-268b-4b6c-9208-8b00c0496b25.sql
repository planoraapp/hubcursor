
-- Adicionar coluna is_admin à tabela habbo_accounts
ALTER TABLE public.habbo_accounts 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;
