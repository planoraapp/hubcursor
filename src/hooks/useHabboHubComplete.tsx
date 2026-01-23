import { useQuery } from '@tanstack/react-query';
import { HabboHubCompleteService } from '../services/HabboHubCompleteService';

const habboHubService = new HabboHubCompleteService();

export const useHabboHubComplete = () => {
  return useQuery({
    queryKey: ['habbohub-complete-categories'],
    queryFn: async () => {
      const categories = await habboHubService.getCategories();
      return categories;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
};