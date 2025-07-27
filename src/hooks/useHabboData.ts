
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getAchievements, 
  discoverRooms, 
  getTopBadgeCollectors, 
  getTopRooms,
  getRealtimeStats,
  type HabboBadge,
  type HabboRoom
} from '../services/habboApi';

// Hook para carregar emblemas
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook para descobrir quartos
export const useDiscoverRooms = () => {
  return useQuery({
    queryKey: ['discover-rooms'],
    queryFn: discoverRooms,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 2000,
  });
};

// Hook para rankings de colecionadores
export const useTopBadgeCollectors = () => {
  return useQuery({
    queryKey: ['top-badge-collectors'],
    queryFn: getTopBadgeCollectors,
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 1,
    retryDelay: 3000,
  });
};

// Hook para quartos populares
export const useTopRooms = () => {
  return useQuery({
    queryKey: ['top-rooms'],
    queryFn: getTopRooms,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 2000,
  });
};

// Hook para estatísticas em tempo real
export const useRealtimeStats = () => {
  return useQuery({
    queryKey: ['realtime-stats'],
    queryFn: getRealtimeStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook para quartos recentes (alias para discoverRooms)
export const useRecentRooms = () => {
  return useDiscoverRooms();
};

// Hook para estatísticas do hotel
export const useHotelStats = () => {
  return useQuery({
    queryKey: ['hotel-stats'],
    queryFn: getRealtimeStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook para top usuários (mockado por enquanto)
export const useTopUsers = () => {
  return useQuery({
    queryKey: ['top-users'],
    queryFn: async () => {
      // Mock data for top users
      return [
        {
          username: 'HabboPlayer1',
          look: 'hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61',
          level: 25
        },
        {
          username: 'HabboPlayer2',
          look: 'hd-180-7.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61',
          level: 23
        },
        {
          username: 'HabboPlayer3',
          look: 'hd-180-2.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61',
          level: 21
        },
        {
          username: 'HabboPlayer4',
          look: 'hd-180-3.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61',
          level: 19
        },
        {
          username: 'HabboPlayer5',
          look: 'hd-180-4.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61',
          level: 18
        }
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para gerenciar estado de loading global
export const useGlobalLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    isLoading,
    error,
    setLoading: setIsLoading,
    setError,
    clearError: () => setError(null)
  };
};
