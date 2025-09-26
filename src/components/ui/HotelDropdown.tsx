import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HOTELS_CONFIG, HotelConfig } from '@/config/hotels';

interface HotelDropdownProps {
  selectedHotel: string;
  onHotelChange: (hotelKey: string) => void;
  className?: string;
}

export const HotelDropdown: React.FC<HotelDropdownProps> = ({
  selectedHotel,
  onHotelChange,
  className = ''
}) => {
  const currentHotel = HOTELS_CONFIG[selectedHotel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-12 h-10 p-0 ${className}`}
          title={`Hotel: ${currentHotel.name}`}
        >
          <img 
            src={currentHotel.flag} 
            alt={`Bandeira ${currentHotel.name}`}
            className="w-6 h-4 object-cover"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(HOTELS_CONFIG).map(([key, hotel]) => (
          <DropdownMenuItem 
            key={key}
            onClick={() => onHotelChange(key)}
            className={`flex items-center gap-2 ${
              selectedHotel === key ? 'bg-blue-50' : ''
            }`}
          >
            <img 
              src={hotel.flag} 
              alt={`Bandeira ${hotel.name}`}
              className="w-4 h-3 object-cover"
            />
            <span>{hotel.name}</span>
            {selectedHotel === key && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
