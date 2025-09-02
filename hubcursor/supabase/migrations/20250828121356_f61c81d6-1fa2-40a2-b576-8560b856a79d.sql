-- ========================================
-- FASE 1: CRIAÇÃO DA ESTRUTURA CRÍTICA DE HABBO_ACCOUNTS
-- ========================================

-- 1. Criar tabela habbo_accounts (ESTRUTURA PRINCIPAL)
CREATE TABLE IF NOT EXISTS public.habbo_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name text NOT NULL,
  habbo_id text NOT NULL,
  hotel text NOT NULL DEFAULT 'br',
  figure_string text,
  motto text,
  is_online boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Índices únicos para performance e consistência
  CONSTRAINT unique_supabase_user UNIQUE (supabase_user_id),
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
);

-- 2. Habilitar RLS
ALTER TABLE public.habbo_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS robustas
CREATE POLICY "Users can view their own habbo account"
  ON public.habbo_accounts
  FOR SELECT
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own habbo account"
  ON public.habbo_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update their own habbo account"
  ON public.habbo_accounts
  FOR UPDATE
  USING (auth.uid() = supabase_user_id)
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Service role can manage all habbo accounts"
  ON public.habbo_accounts
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_habbo_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habbo_accounts_updated_at
  BEFORE UPDATE ON public.habbo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_habbo_accounts_updated_at();

-- 5. Criar usuário BEEBOP de teste (CRÍTICO para funcionar)
-- Primeiro precisamos criar o usuário Supabase, depois linkar
-- Por enquanto vamos usar um UUID temporário que será substituído pela Edge Function