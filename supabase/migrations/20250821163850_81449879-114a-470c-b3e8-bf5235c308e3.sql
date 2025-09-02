-- ETAPA 3: Sistema de Queue para Processamento Distribuído
-- Criar tabela para gerenciar processamento de amigos em chunks

CREATE TABLE public.friends_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_habbo_name TEXT NOT NULL,
  user_habbo_id TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  friend_habbo_name TEXT NOT NULL,
  friend_habbo_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  priority INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_friends_processing_queue_status ON public.friends_processing_queue(status);
CREATE INDEX idx_friends_processing_queue_priority ON public.friends_processing_queue(priority DESC, created_at ASC);
CREATE INDEX idx_friends_processing_queue_user ON public.friends_processing_queue(user_habbo_name, hotel);
CREATE INDEX idx_friends_processing_queue_processing ON public.friends_processing_queue(status, last_processed_at);

-- Enable RLS
ALTER TABLE public.friends_processing_queue ENABLE ROW LEVEL SECURITY;

-- Policy para permitir que service role gerencie a queue
CREATE POLICY "Service role can manage friends processing queue"
ON public.friends_processing_queue
FOR ALL
USING (true)
WITH CHECK (true);

-- Policy para usuários autenticados visualizarem apenas suas próprias entradas
CREATE POLICY "Users can view their own processing queue"
ON public.friends_processing_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.habbo_accounts 
    WHERE habbo_accounts.supabase_user_id = auth.uid() 
    AND lower(habbo_accounts.habbo_name) = lower(friends_processing_queue.user_habbo_name)
  )
);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_friends_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER trigger_update_friends_queue_updated_at
  BEFORE UPDATE ON public.friends_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_friends_queue_updated_at();

-- Função para popular a queue com amigos de um usuário
CREATE OR REPLACE FUNCTION public.populate_friends_queue(
  p_user_habbo_name TEXT,
  p_user_habbo_id TEXT,
  p_hotel TEXT DEFAULT 'br'
)
RETURNS INTEGER AS $$
DECLARE
  v_inserted_count INTEGER := 0;
BEGIN
  -- Esta função será chamada pelo edge function com a lista de amigos
  -- Por enquanto, apenas retorna 0
  RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter próximos itens da queue para processamento
CREATE OR REPLACE FUNCTION public.get_next_queue_batch(
  p_batch_size INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_habbo_name TEXT,
  user_habbo_id TEXT,
  hotel TEXT,
  friend_habbo_name TEXT,
  friend_habbo_id TEXT,
  priority INTEGER,
  retry_count INTEGER
) AS $$
BEGIN
  -- Marcar items como 'processing' e retornar batch
  UPDATE public.friends_processing_queue
  SET 
    status = 'processing',
    last_processed_at = now()
  WHERE id IN (
    SELECT fq.id 
    FROM public.friends_processing_queue fq
    WHERE fq.status = 'pending' 
    AND fq.retry_count < fq.max_retries
    ORDER BY fq.priority DESC, fq.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  );

  -- Retornar os items que foram marcados para processamento
  RETURN QUERY
  SELECT 
    fq.id,
    fq.user_habbo_name,
    fq.user_habbo_id,
    fq.hotel,
    fq.friend_habbo_name,
    fq.friend_habbo_id,
    fq.priority,
    fq.retry_count
  FROM public.friends_processing_queue fq
  WHERE fq.status = 'processing' 
  AND fq.last_processed_at >= now() - INTERVAL '1 minute'
  ORDER BY fq.priority DESC, fq.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar item como processado
CREATE OR REPLACE FUNCTION public.mark_queue_item_completed(
  p_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.friends_processing_queue
  SET 
    status = 'completed',
    updated_at = now()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar item como falha
CREATE OR REPLACE FUNCTION public.mark_queue_item_failed(
  p_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.friends_processing_queue
  SET 
    status = CASE 
      WHEN retry_count >= max_retries THEN 'failed'
      ELSE 'pending'
    END,
    retry_count = retry_count + 1,
    error_message = p_error_message,
    updated_at = now(),
    last_processed_at = NULL
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função de limpeza para remover itens antigos processados
CREATE OR REPLACE FUNCTION public.cleanup_processed_queue_items()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.friends_processing_queue
  WHERE status = 'completed' 
  AND updated_at < now() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;