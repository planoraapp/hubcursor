
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
