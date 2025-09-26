import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTestPhotos = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testPhotos = async (username: string = 'Beebop', hotel: string = 'com.br') => {
    setIsLoading(true);
    try {
            const { data, error } = await supabase.functions.invoke('test-habbo-photos', {
        body: { username, hotel }
      });

      if (error) {
                throw new Error(error.message || 'Failed to test photos');
      }

            setResults(data);
      return data;
      
    } catch (error) {
            throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { testPhotos, isLoading, results };
};