
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type HotelCode = 'br' | 'com' | 'es' | 'fr' | 'de' | 'it' | 'nl' | 'fi' | 'tr';

interface HotelContextType {
  selectedHotel: HotelCode;
  setSelectedHotel: (hotel: HotelCode) => void;
  currentHotel: HotelCode;
  setCurrentHotel: (hotel: HotelCode) => void;
  availableHotels: HotelCode[];
  userHotel: HotelCode | null;
  isUserHotel: boolean;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedHotel, setSelectedHotel] = useState<HotelCode>('br');
  const [userHotel] = useState<HotelCode | null>('br'); // This would come from user data
  
  const availableHotels: HotelCode[] = ['br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr'];
  const isUserHotel = selectedHotel === userHotel;

  return (
    <HotelContext.Provider value={{ 
      selectedHotel, 
      setSelectedHotel,
      currentHotel: selectedHotel,
      setCurrentHotel: setSelectedHotel,
      availableHotels,
      userHotel,
      isUserHotel
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = (): HotelContextType => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
