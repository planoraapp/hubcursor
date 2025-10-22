
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/contexts/I18nContext';

export interface BadgeTranslation {
  code: string;
  name: string;
  description: string;
  registrationDate?: string;
  hotel: string;
}

interface UseBadgeTranslationProps {
  badgeCode: string;
  enabled?: boolean;
}

export const useBadgeTranslation = ({ badgeCode, enabled = true }: UseBadgeTranslationProps) => {
  const { language } = useI18n();

  return useQuery({
    queryKey: ['badge-translation', badgeCode, language],
    queryFn: async () => {
            const { data, error } = await supabase.functions.invoke('badge-translations', {
        body: { badgeCode, language: language }
      });

      if (error) {
                throw error;
      }

      return data;
    },
    enabled: enabled && !!badgeCode,
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook para cache local de traduções comuns
export const useBadgeTranslationCache = () => {
  const { language } = useI18n();

  const getCachedTranslation = (badgeCode: string): BadgeTranslation | null => {
    try {
      const cacheKey = `badge_translation_${badgeCode}_${language}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Verificar se o cache não expirou (24 horas)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (error) {
          }
    return null;
  };

  const setCachedTranslation = (badgeCode: string, translation: BadgeTranslation) => {
    try {
      const cacheKey = `badge_translation_${badgeCode}_${language}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data: translation,
        timestamp: Date.now()
      }));
    } catch (error) {
          }
  };

  return { getCachedTranslation, setCachedTranslation };
};
