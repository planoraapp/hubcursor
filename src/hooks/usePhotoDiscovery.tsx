import { useState } from 'react';
import { useUnifiedPhotos } from './useUnifiedAPI';

export const usePhotoDiscovery = () => {
  const [username, setUsername] = useState<string>('Beebop');
  const [hotel, setHotel] = useState<string>('br');
  
  const { 
    data: results, 
    loading: isLoading, 
    error, 
    fetchData: discoverPhotos 
  } = useUnifiedPhotos({
    username,
    hotel,
    action: 'discover',
    enabled: false // Don't auto-fetch
  });

  const discoverPhotosForUser = async (newUsername: string = 'Beebop', newHotel: string = 'br') => {
    setUsername(newUsername);
    setHotel(newHotel);
    
    try {
            await discoverPhotos({
        username: newUsername,
        hotel: newHotel,
        action: 'discover'
      });

            return results;
      
    } catch (error) {
            throw error;
    }
  };

  return { 
    discoverPhotos: discoverPhotosForUser, 
    isLoading, 
    results,
    error 
  };
};