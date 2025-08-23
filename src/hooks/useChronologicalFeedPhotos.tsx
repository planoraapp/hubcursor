import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompleteProfile } from './useCompleteProfile';
import { useDailyActivitiesTracker } from './useDailyActivitiesTracker';

interface ChronologicalPhoto {
  id: string;
  photo_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  s3_url: string;
  preview_url?: string;
  caption?: string;
  room_name?: string;
  likes_count: number;
  timestamp_taken?: number;
  taken_date?: string;
  created_at: string;
  date: string; // Formatted date for display
}

export const useChronologicalFeedPhotos = (currentUserName: string, hotel: string = 'br') => {
  const { data: profileData, isLoading: profileLoading } = useCompleteProfile(currentUserName, hotel);
  const { trackUserActivities } = useDailyActivitiesTracker();
  const friends = profileData?.data?.friends || [];

  const queryResult = useQuery({
    queryKey: ['chronological-feed-photos', currentUserName, hotel, friends.length],
    queryFn: async (): Promise<ChronologicalPhoto[]> => {
      console.log(`[📸 CHRONOLOGICAL FEED] Fetching photos for ${currentUserName} with ${friends.length} friends`);

      if (friends.length === 0) {
        console.log('[📸 CHRONOLOGICAL FEED] No friends found, returning empty array');
        return [];
      }

      try {
        // Trigger daily activities tracking for the user first (async, don't wait)
        if (currentUserName && profileData?.uniqueId) {
          trackUserActivities(currentUserName, profileData.uniqueId, hotel).catch(console.error);
        }

        // Get friend names for the query
        const friendNames = friends.map(f => f.name).slice(0, 100); // Limit to 100 friends for performance
        
        console.log(`[📸 CHRONOLOGICAL FEED] Querying photos for ${friendNames.length} friends`);
        
        // Query photos from the last 48 hours, ordered by real timestamp
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        const { data: photos, error } = await supabase
          .from('habbo_photos')
          .select(`
            id,
            photo_id,
            habbo_name,
            habbo_id,
            hotel,
            s3_url,
            preview_url,
            caption,
            room_name,
            likes_count,
            timestamp_taken,
            taken_date,
            created_at
          `)
          .in('habbo_name', friendNames)
          .eq('hotel', hotel)
          .gte('created_at', twoDaysAgo.toISOString())
          .order('timestamp_taken', { ascending: false, nullsFirst: false })
          .limit(200); // Get more photos for better diversity

        if (error) {
          console.error('[📸 CHRONOLOGICAL FEED] Query error:', error);
          throw error;
        }

        if (!photos || photos.length === 0) {
          console.log('[📸 CHRONOLOGICAL FEED] No photos found for friends');
          return [];
        }

        console.log(`[📸 CHRONOLOGICAL FEED] Found ${photos.length} photos, processing chronologically...`);
        
        // Process and sort photos chronologically
        const processedPhotos = photos
          .filter(photo => photo.s3_url && photo.habbo_name)
          .map(photo => {
            // Determine the actual timestamp for sorting
            let actualTimestamp: number;
            
            if (photo.timestamp_taken) {
              actualTimestamp = photo.timestamp_taken;
            } else if (photo.taken_date) {
              actualTimestamp = new Date(photo.taken_date).getTime();
            } else {
              actualTimestamp = new Date(photo.created_at).getTime();
            }
            
            // Format display date
            const displayDate = new Date(actualTimestamp).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return {
              ...photo,
              date: displayDate,
              sortTimestamp: actualTimestamp
            };
          })
          // Sort by real timestamp (most recent first)
          .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
          // Remove duplicate photos (same photo_id)
          .filter((photo, index, arr) => 
            index === arr.findIndex(p => p.photo_id === photo.photo_id)
          )
          // Ensure diversity - limit consecutive photos from same user
          .reduce((acc: any[], photo) => {
            const lastPhoto = acc[acc.length - 1];
            const secondLastPhoto = acc[acc.length - 2];
            
            // Allow photo if:
            // 1. It's the first photo, OR
            // 2. It's from a different user than the last photo, OR
            // 3. It's from same user but last 2 photos aren't from this user
            if (!lastPhoto || 
                lastPhoto.habbo_name !== photo.habbo_name ||
                !secondLastPhoto || 
                secondLastPhoto.habbo_name !== photo.habbo_name) {
              acc.push(photo);
            }
            
            return acc;
          }, [])
          .slice(0, 50); // Final limit for feed display

        console.log(`[📸 CHRONOLOGICAL FEED] Processed ${processedPhotos.length} chronological photos`);
        
        // Log diversity stats
        const userCounts = processedPhotos.reduce((acc, photo) => {
          acc[photo.habbo_name] = (acc[photo.habbo_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('[📸 CHRONOLOGICAL FEED] Photo diversity:', {
          totalUsers: Object.keys(userCounts).length,
          photosPerUser: userCounts
        });

        return processedPhotos;
      } catch (error: any) {
        console.error('[📸 CHRONOLOGICAL FEED] Fetch failed:', error);
        throw error;
      }
    },
    enabled: !!currentUserName && !profileLoading && friends.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

  return {
    photos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isEmpty: !queryResult.isLoading && (queryResult.data?.length || 0) === 0,
    lastUpdate: queryResult.dataUpdatedAt
  };
};