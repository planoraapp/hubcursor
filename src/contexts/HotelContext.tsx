
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HotelContextType {
  selectedHotel: string;
  setSelectedHotel: (hotel: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedHotel, setSelectedHotel] = useState('br');

  return (
    <HotelContext.Provider value={{ selectedHotel, setSelectedHotel }}>
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
