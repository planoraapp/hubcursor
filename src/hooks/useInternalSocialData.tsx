import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InternalSocialData {
  likesCount: number;
  commentsCount: number;
}

export const useInternalSocialData = (photoId: string) => {
  const { data: socialData, isLoading } = useQuery({
    queryKey: ['internal-social-data', photoId],
    queryFn: async (): Promise<InternalSocialData> => {
      if (!photoId) {
        return { likesCount: 0, commentsCount: 0 };
      }

      // Get likes count
      const { count: likesCount } = await supabase
        .from('photo_likes')
        .select('*', { count: 'exact', head: true })
        .eq('photo_id', photoId);

      // Get comments count  
      const { count: commentsCount } = await supabase
        .from('photo_comments')
        .select('*', { count: 'exact', head: true })
        .eq('photo_id', photoId);

      return {
        likesCount: likesCount || 0,
        commentsCount: commentsCount || 0
      };
    },
    enabled: !!photoId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    socialData: socialData || { likesCount: 0, commentsCount: 0 },
    isLoading
  };
};