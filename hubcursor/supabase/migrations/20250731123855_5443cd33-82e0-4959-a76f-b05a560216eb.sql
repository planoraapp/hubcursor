-- Criar tabela de cache para dados do Habbo se ela não existir
CREATE TABLE IF NOT EXISTS public.habbo_figures_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Criar índice para consultas por expiração
CREATE INDEX IF NOT EXISTS idx_habbo_figures_cache_expires_at 
ON public.habbo_figures_cache(expires_at);

-- Habilitar RLS (mesmo sendo dados públicos, é boa prática)
ALTER TABLE public.habbo_figures_cache ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura dos dados de cache
CREATE POLICY IF NOT EXISTS "Cache é acessível publicamente" 
ON public.habbo_figures_cache 
FOR SELECT 
USING (true);

-- Política para permitir inserção de novos dados de cache (via service role)
CREATE POLICY IF NOT EXISTS "Inserção de cache via service role" 
ON public.habbo_figures_cache 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir limpeza de cache expirado
CREATE POLICY IF NOT EXISTS "Limpeza de cache expirado" 
ON public.habbo_figures_cache 
FOR DELETE 
USING (expires_at < now());