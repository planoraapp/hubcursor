
import React from 'react';
import { Button } from '@/components/ui/button';
import { useHotel, HotelCode } from '../contexts/HotelContext';
import { CountryFlags } from './marketplace/CountryFlags';

interface HotelSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const hotelNames: Record<HotelCode, string> = {
  'br': 'Brasil',
  'com': 'Global',
  'es': 'España',
  'fr': 'France',
  'de': 'Deutschland',
  'it': 'Italia',
  'nl': 'Nederland',
  'fi': 'Suomi',
  'tr': 'Türkiye'
};

export const HotelSelector: React.FC<HotelSelectorProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { currentHotel, setCurrentHotel, availableHotels, userHotel, isUserHotel } = useHotel();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium volter-font text-white" style={{
          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
        }}>
          Hotel:
        </span>
      )}
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
        {availableHotels.map((hotel) => (
          <Button
            key={hotel}
            variant={currentHotel === hotel ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentHotel(hotel)}
            className={`relative h-8 px-2 ${
              currentHotel === hotel 
                ? 'bg-white/90 text-black shadow-md' 
                : 'bg-transparent text-white hover:bg-white/20'
            }`}
            title={`${hotelNames[hotel]} ${hotel === userHotel ? '(Seu Hotel)' : ''}`}
          >
            <CountryFlags hotelId={hotel} className="w-4 h-3" />
            <span className="ml-1 text-xs volter-font">
              {hotel.toUpperCase()}
            </span>
            {hotel === userHotel && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
            )}
          </Button>
        ))}
      </div>
      {!isUserHotel && userHotel && (
        <span className="text-xs text-yellow-300 volter-font">
          Visualizando {hotelNames[currentHotel]}
        </span>
      )}
    </div>
  );
};
