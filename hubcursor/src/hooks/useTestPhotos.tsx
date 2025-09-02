import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTestPhotos = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testPhotos = async (username: string = 'Beebop', hotel: string = 'com.br') => {
    setIsLoading(true);
    try {
      console.log(`[useTestPhotos] Testing photo discovery for ${username} on ${hotel}`);
      
      const { data, error } = await supabase.functions.invoke('test-habbo-photos', {
        body: { username, hotel }
      });

      if (error) {
        console.error('[useTestPhotos] Error:', error);
        throw new Error(error.message || 'Failed to test photos');
      }

      console.log('[useTestPhotos] Test results:', data);
      setResults(data);
      return data;
      
    } catch (error) {
      console.error('[useTestPhotos] Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { testPhotos, isLoading, results };
};