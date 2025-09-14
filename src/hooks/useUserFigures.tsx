import { useQuery } from '@tanstack/react-query';
import { unifiedHabboService } from '@/services/unifiedHabboService';
import { useMemo } from 'react';

export const useUserFigures = (usernames: string[]) => {
  const { data: figureMap = {}, isLoading } = useQuery({
    queryKey: ['user-figures', usernames.join(',')],
    queryFn: async () => {
      if (usernames.length === 0) return {};
      
            const figureMap: Record<string, string> = {};
      
      // Fetch figures in batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < usernames.length; i += batchSize) {
        const batch = usernames.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (username) => {
            try {
              const user = await unifiedHabboService.getUserProfile(username);
              if (user?.figureString) {
                figureMap[username] = user.figureString;
              }
            } catch (error) {
                          }
          })
        );
        
        // Small delay between batches
        if (i + batchSize < usernames.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`✅ [useUserFigures] Fetched ${Object.keys(figureMap).length}/${usernames.length} user figures`);
      return figureMap;
    },
    enabled: usernames.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (renamed from cacheTime)
  });

  return {
    figureMap,
    isLoading
  };
};
