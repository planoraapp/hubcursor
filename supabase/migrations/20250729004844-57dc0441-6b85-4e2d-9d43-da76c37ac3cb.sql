
-- Criar tabela para vínculos entre contas Habbo e usuários Supabase
CREATE TABLE public.habbo_accounts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  habbo_id text NOT NULL UNIQUE,
  habbo_name text NOT NULL,
  supabase_user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT habbo_accounts_pkey PRIMARY KEY (id)
);

-- Adicionar foreign key para auth.users
ALTER TABLE public.habbo_accounts ADD CONSTRAINT habbo_accounts_supabase_user_id_fkey FOREIGN KEY (supabase_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.habbo_accounts ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler sua própria conta vinculada
CREATE POLICY "Users can read their own linked habbo account" ON public.habbo_accounts
FOR SELECT USING (auth.uid() = supabase_user_id);

-- Política: Usuários podem inserir sua própria conta vinculada
CREATE POLICY "Users can insert their own linked habbo account" ON public.habbo_accounts
FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

-- Política: Usuários podem atualizar sua própria conta vinculada
CREATE POLICY "Users can update their own linked habbo account" ON public.habbo_accounts
FOR UPDATE USING (auth.uid() = supabase_user_id);
