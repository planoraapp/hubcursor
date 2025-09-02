
-- Primeiro, corrigir privilégios de admin para Beebop
UPDATE public.habbo_accounts 
SET is_admin = true 
WHERE habbo_name ILIKE 'beebop';

-- Criar função para inicializar home padrão de um usuário
CREATE OR REPLACE FUNCTION public.initialize_user_home(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir background padrão se não existir
  INSERT INTO public.user_home_backgrounds (user_id, background_type, background_value)
  VALUES (user_uuid, 'color', '#007bff')
  ON CONFLICT DO NOTHING;

  -- Inserir widgets padrão se não existirem
  INSERT INTO public.user_home_layouts (user_id, widget_id, x, y, z_index, width, height, is_visible)
  VALUES 
    (user_uuid, 'avatar', 20, 80, 1, 300, 280, true),
    (user_uuid, 'guestbook', 350, 80, 1, 400, 350, true),
    (user_uuid, 'rating', 780, 80, 1, 200, 150, true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Criar trigger function que executa quando um usuário faz login pela primeira vez
CREATE OR REPLACE FUNCTION public.handle_new_user_home()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é o primeiro login (não tem dados de home ainda)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_home_layouts WHERE user_id = NEW.supabase_user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_home_backgrounds WHERE user_id = NEW.supabase_user_id
  ) THEN
    -- Inicializar home padrão
    PERFORM public.initialize_user_home(NEW.supabase_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela habbo_accounts para auto-inicialização
DROP TRIGGER IF EXISTS trigger_initialize_user_home ON public.habbo_accounts;
CREATE TRIGGER trigger_initialize_user_home
  AFTER INSERT ON public.habbo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_home();

-- Inicializar homes para usuários existentes que não têm home ainda
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT supabase_user_id 
    FROM public.habbo_accounts 
    WHERE supabase_user_id NOT IN (
      SELECT DISTINCT user_id FROM public.user_home_layouts
    )
  LOOP
    PERFORM public.initialize_user_home(user_record.supabase_user_id);
  END LOOP;
END $$;
