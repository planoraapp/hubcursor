
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';

export type HotelCode = 'br' | 'com' | 'es' | 'fr' | 'de' | 'it' | 'nl' | 'fi' | 'tr';

interface HotelContextType {
  currentHotel: HotelCode;
  userHotel: HotelCode | null;
  setCurrentHotel: (hotel: HotelCode) => void;
  isUserHotel: boolean;
  availableHotels: HotelCode[];
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const availableHotels: HotelCode[] = ['br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr'];

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const { habboAccount } = useUnifiedAuth();
  const [currentHotel, setCurrentHotel] = useState<HotelCode>('br');
  
  const userHotel = habboAccount?.hotel as HotelCode || null;

  useEffect(() => {
    // Definir hotel atual baseado no usuário logado ou localStorage
    if (userHotel) {
      const savedHotel = localStorage.getItem('selectedHotel') as HotelCode;
      if (savedHotel && availableHotels.includes(savedHotel)) {
        setCurrentHotel(savedHotel);
      } else {
        setCurrentHotel(userHotel);
      }
    } else {
      const savedHotel = localStorage.getItem('selectedHotel') as HotelCode;
      if (savedHotel && availableHotels.includes(savedHotel)) {
        setCurrentHotel(savedHotel);
      }
    }
  }, [userHotel]);

  const handleSetCurrentHotel = (hotel: HotelCode) => {
    setCurrentHotel(hotel);
    localStorage.setItem('selectedHotel', hotel);
  };

  const isUserHotel = userHotel === currentHotel;

  return (
    <HotelContext.Provider value={{
      currentHotel,
      userHotel,
      setCurrentHotel: handleSetCurrentHotel,
      isUserHotel,
      availableHotels
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
