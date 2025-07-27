
import { useState, useEffect } from 'react';

interface GeolocationData {
  country: string | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [geoData, setGeoData] = useState<GeolocationData>({
    country: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Primeiro, tentar detectar pelo timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (timezone.includes('America/Sao_Paulo') || timezone.includes('America/Recife')) {
          setGeoData({ country: 'brazil', loading: false, error: null });
          return;
        }
        
        if (timezone.includes('Europe/Madrid') || timezone.includes('Atlantic/Canary')) {
          setGeoData({ country: 'spain', loading: false, error: null });
          return;
        }

        // Fallback para API de geolocalização
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        let detectedCountry = 'brazil'; // Padrão
        
        if (data.country_code === 'BR') {
          detectedCountry = 'brazil';
        } else if (data.country_code === 'ES') {
          detectedCountry = 'spain';
        }
        
        setGeoData({ country: detectedCountry, loading: false, error: null });
      } catch (error) {
        console.error('Erro ao detectar localização:', error);
        setGeoData({ country: 'brazil', loading: false, error: 'Erro ao detectar localização' });
      }
    };

    detectCountry();
  }, []);

  return geoData;
};
