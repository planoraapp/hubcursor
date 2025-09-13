// src/hooks/useRealFigureData.tsx
// Hook para carregar dados reais do figuredata.json (estratégia ViaJovem)

import { useQuery } from '@tanstack/react-query';
import { realFigureDataService, RealFigureDataCategory } from '@/services/RealFigureDataService';

export const useRealFigureData = () => {
  return useQuery({
    queryKey: ['real-figuredata'],
    queryFn: () => realFigureDataService.loadRealFigureData(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};

export const useRealFigureDataCategory = (categoryId: string, gender?: 'M' | 'F') => {
  return useQuery({
    queryKey: ['real-figuredata-category', categoryId, gender],
    queryFn: () => realFigureDataService.getCategory(categoryId, gender),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};

export const useRealFigureDataStats = () => {
  return useQuery({
    queryKey: ['real-figuredata-stats'],
    queryFn: () => realFigureDataService.getStats(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};
