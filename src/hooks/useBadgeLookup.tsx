import { useMemo } from 'react';
import { useRealBadges } from './useRealBadges';
import { useValidatedBadges } from './useValidatedBadges';
import { useHabboApiBadges } from './useHabboApiBadges';

interface BadgeInfo {
  code: string;
  name: string;
  imageUrl?: string;
  source: 'real' | 'validated' | 'api' | 'fallback';
}

export const useBadgeLookup = () => {
  const { data: realBadges } = useRealBadges({ enabled: true });
  const { data: validatedBadges } = useValidatedBadges({ enabled: true });
  const { data: apiBadges } = useHabboApiBadges({ enabled: true });

  const badgeMap = useMemo(() => {
    const map = new Map<string, BadgeInfo>();
    
    // Adicionar badges reais (prioridade mais alta)
    realBadges?.badges?.forEach(badge => {
      const normalizedName = badge.name.toLowerCase().trim();
      map.set(normalizedName, {
        code: badge.code,
        name: badge.name,
        imageUrl: badge.imageUrl,
        source: 'real'
      });
    });

    // Adicionar badges validados (prioridade média)
    validatedBadges?.badges?.forEach(badge => {
      // ValidatedBadgeItem usa propriedades diferentes
      const badgeName = (badge as any).badge_name || badge.id || '';
      const badgeCode = (badge as any).badge_code || badge.id || '';
      const normalizedName = badgeName.toLowerCase().trim();
      
      if (normalizedName && !map.has(normalizedName)) {
        map.set(normalizedName, {
          code: badgeCode,
          name: badgeName,
          imageUrl: (badge as any).image_url,
          source: 'validated'
        });
      }
    });

    // Adicionar badges da API (prioridade menor)
    apiBadges?.badges?.forEach(badge => {
      const normalizedName = badge.name.toLowerCase().trim();
      if (!map.has(normalizedName)) {
        map.set(normalizedName, {
          code: badge.code,
          name: badge.name,
          imageUrl: badge.imageUrl,
          source: 'api'
        });
      }
    });

    return map;
  }, [realBadges, validatedBadges, apiBadges]);

  const findBadge = (badgeName: string): BadgeInfo | null => {
    const normalizedName = badgeName.toLowerCase().trim();
    
    // Busca exata
    let badge = badgeMap.get(normalizedName);
    if (badge) return badge;

    // Busca fuzzy - palavras parciais
    for (const [key, value] of badgeMap.entries()) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        return value;
      }
    }

    // Mapeamento manual para badges conhecidos
    const knownMappings: Record<string, string> = {
      'habboniversário 25': 'Y25',
      'habbo25': 'Y25', 
      'aniversário': 'Y25',
      'staff': 'ADM',
      'administrador': 'ADM',
      'moderador': 'MOD',
      'helper': 'HLP',
      'vip': 'VIP',
      'hc': 'HC1'
    };

    const mappedCode = knownMappings[normalizedName];
    if (mappedCode) {
      return {
        code: mappedCode,
        name: badgeName,
        source: 'fallback'
      };
    }

    return null;
  };

  return {
    findBadge,
    isLoading: !realBadges && !validatedBadges && !apiBadges
  };
};