import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { unifiedHabboService } from '@/services/unifiedHabboService';
export interface HabboPublicData {
  id: string;
  name: string;
  motto: string;
  online: boolean;
  memberSince: string;
  figureString: string;
  profileVisible: boolean;
  lastWebVisit?: string;
  uniqueId: string;
  selectedBadges: Array<{
    code: string;
    name: string;
    description: string;
  }>;
  badges: Array<{
    code: string;
    name: string;
    description: string;
  }>;
}

export const useHabboPublicData = (username: string, hotel: string = 'com.br') => {
  const [data, setData] = useState<HabboPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do perfil público do Habbo
  const { 
    data: profileData, 
    isLoading: profileLoading, 
    error: profileError 
  } = useQuery({
    queryKey: ['habbo-user', username],
    queryFn: async () => {
      if (!username) {
                return null;
      }
      
      console.log(`🔍 [useHabboPublicData] Buscando dados públicos para: ${username} (${hotel})`);
      
      try {
        const profile = await unifiedHabboService.getUserProfile(username, hotel);
        
        if (!profile) {
                    return null; // Retorna null em vez de throw error
        }
        
                return profile;
      } catch (err) {
                return null; // Retorna null em vez de throw error
      }
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Reduzir tentativas
    retryOnMount: false, // Não tentar novamente ao montar
  });

  // Buscar emblemas do usuário
  const { 
    data: badgesData = [], 
    isLoading: badgesLoading 
  } = useQuery({
    queryKey: ['habbo-public-badges', username, hotel],
    queryFn: async () => {
      if (!username || !profileData) return [];
      
      try {
        const badges = await unifiedHabboService.getUserBadges(username, hotel);
                return Array.isArray(badges) ? badges : [];
      } catch (err) {
                return [];
      }
    },
    enabled: !!username && !!profileData,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Processar dados quando disponíveis
  useEffect(() => {
    if (profileData) {
      const processedData: HabboPublicData = {
        id: profileData.id || profileData.uniqueId || '',
        name: profileData.name || username,
        motto: profileData.motto || '',
        online: profileData.online || false,
        memberSince: profileData.memberSince || profileData.registeredDate || '',
        figureString: profileData.figureString || '',
        profileVisible: profileData.profileVisible ?? true,
        lastWebVisit: profileData.lastWebVisit,
        uniqueId: profileData.uniqueId || profileData.id || '',
        selectedBadges: profileData.selectedBadges || [],
        badges: badgesData,
      };
      
      setData(processedData);
      setLoading(false);
      setError(null);
      
          } else if (profileError) {
      setError(profileError.message || 'Erro ao buscar dados do usuário');
      setLoading(false);
    }
  }, [profileData, badgesData, profileError, username]);

  // Gerar URL do avatar
  const avatarUrl = data?.figureString 
    ? unifiedHabboService.getAvatarUrl(data.figureString, 'l', false)
    : `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=3&action=std`;

  return {
    data: data || null,
    avatarUrl,
    isLoading: loading || profileLoading || badgesLoading,
    error,
    refetch: () => {
      // Implementar refetch se necessário
    }
  };
};
