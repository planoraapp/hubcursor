
-- Adicionar coluna category à tabela habbo_badges
ALTER TABLE public.habbo_badges 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'others' CHECK (category IN ('official', 'achievements', 'fansites', 'others'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_habbo_badges_category ON public.habbo_badges(category);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_source ON public.habbo_badges(source);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_active ON public.habbo_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_badges_last_validated ON public.habbo_badges(last_validated_at);

-- Atualizar badges existentes com categorização baseada no badge_code
UPDATE public.habbo_badges 
SET category = CASE 
  WHEN UPPER(badge_code) LIKE '%ADM%' OR UPPER(badge_code) LIKE '%MOD%' OR UPPER(badge_code) LIKE '%STAFF%' 
       OR UPPER(badge_code) LIKE '%VIP%' OR UPPER(badge_code) LIKE '%GUIDE%' OR UPPER(badge_code) LIKE '%HELPER%' THEN 'official'
  WHEN UPPER(badge_code) LIKE '%ACH%' OR UPPER(badge_code) LIKE '%GAM%' OR UPPER(badge_code) LIKE '%WIN%' 
       OR UPPER(badge_code) LIKE '%VICTORY%' OR UPPER(badge_code) LIKE '%CHAMPION%' THEN 'achievements'
  WHEN UPPER(badge_code) LIKE '%FANSITE%' OR UPPER(badge_code) LIKE '%PARTNER%' OR UPPER(badge_code) LIKE '%EVENT%' 
       OR UPPER(badge_code) LIKE '%SPECIAL%' OR UPPER(badge_code) LIKE '%EXCLUSIVE%' THEN 'fansites'
  ELSE 'others'
END
WHERE category IS NULL OR category = 'others';
