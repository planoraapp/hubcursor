-- ========================================
-- FASE 2: CORREÇÃO CRÍTICA DE SEGURANÇA RLS
-- ========================================

-- Habilitar RLS nas tabelas críticas que estão expostas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_user_activities_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_profiles_cache ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para as tabelas habilitadas
CREATE POLICY "Users can manage their own conversations"
  ON public.conversations
  FOR ALL
  USING (
    participant_1 = current_setting('request.jwt.claims', true)::json ->> 'sub' OR
    participant_2 = current_setting('request.jwt.claims', true)::json ->> 'sub'
  );

CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant_1 = current_setting('request.jwt.claims', true)::json ->> 'sub' OR
           participant_2 = current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

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
  USING (user_id = current_setting('request.jwt.claims', true)::json::uuid);