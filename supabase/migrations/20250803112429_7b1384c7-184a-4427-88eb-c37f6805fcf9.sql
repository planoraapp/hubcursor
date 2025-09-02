
-- Verificar e adicionar coluna category se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'habbo_badges' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.habbo_badges 
        ADD COLUMN category text DEFAULT 'others';
        
        -- Adicionar constraint para categorias válidas
        ALTER TABLE public.habbo_badges 
        ADD CONSTRAINT check_category 
        CHECK (category IN ('official', 'achievements', 'fansites', 'others'));
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_category ON public.habbo_badges(category);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_source ON public.habbo_badges(source);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_code ON public.habbo_badges(badge_code);

-- Limpar dados antigos e preparar para nova população
DELETE FROM public.habbo_badges;

-- Resetar sequência se existir
-- (Usar UUID então não é necessário resetar sequência)
