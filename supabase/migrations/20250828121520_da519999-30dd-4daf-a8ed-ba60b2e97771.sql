-- ========================================
-- FASE 2: CORREÇÃO CRÍTICA DE SEGURANÇA RLS (CORRIGIDO)
-- ========================================

-- Habilitar RLS nas tabelas críticas que estão expostas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_activities_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_profiles_cache ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para as tabelas habilitadas (CORRIGIDO com auth.uid())
CREATE POLICY "Service role can manage conversations"
  ON public.conversations
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role can manage chat messages"
  ON public.chat_messages
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Anyone can view habbo groups"
  ON public.habbo_groups
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view habbo rooms"
  ON public.habbo_rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage user activities cache"
  ON public.habbo_user_activities_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role can manage profiles cache"
  ON public.habbo_profiles_cache
  FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Users manage their own friends"
  ON public.friends
  FOR ALL
  USING (user_id = auth.uid());