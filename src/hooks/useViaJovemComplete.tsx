// src/hooks/useViaJovemComplete.tsx
// Hook para usar o sistema completo da ViaJovem

import { useQuery } from '@tanstack/react-query';
import { viaJovemCompleteService, ViaJovemCategory, ViaJovemClothingItem } from '@/services/ViaJovemCompleteService';

export const useViaJovemComplete = () => {
  return useQuery({
    queryKey: ['viajovem-complete'],
    queryFn: () => viaJovemCompleteService.getCategories(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};

export const useViaJovemCompleteCategory = (categoryId: string, gender?: 'M' | 'F') => {
  return useQuery({
    queryKey: ['viajovem-complete-category', categoryId, gender],
    queryFn: async () => {
      const categories = await viaJovemCompleteService.getCategories();
      const category = categories.find(cat => cat.id === categoryId);
      
      if (!category) return null;
      
      if (gender) {
        return {
          ...category,
          items: category.items.filter(item => item.gender === gender || item.gender === 'U')
        };
      }
      
      return category;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};

export const useViaJovemCompleteStats = () => {
  return useQuery({
    queryKey: ['viajovem-complete-stats'],
    queryFn: () => viaJovemCompleteService.getStats(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};
