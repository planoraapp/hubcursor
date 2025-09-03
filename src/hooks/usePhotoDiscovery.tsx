import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePhotoDiscovery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const discoverPhotos = async (username: string = 'Beebop', hotel: string = 'com.br') => {
    setIsLoading(true);
    try {
      console.log(`[usePhotoDiscovery] Starting advanced discovery for ${username} on ${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-photo-discovery', {
        body: { username, hotel }
      });

      if (error) {
        console.error('[usePhotoDiscovery] Error:', error);
        throw new Error(error.message || 'Failed to discover photos');
      }

      console.log('[usePhotoDiscovery] Discovery results:', data);
      setResults(data);
      return data;
      
    } catch (error) {
      console.error('[usePhotoDiscovery] Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { discoverPhotos, isLoading, results };
};