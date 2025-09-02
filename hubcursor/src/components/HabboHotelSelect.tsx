
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface HabboHotelSelectProps {
  selectedHotel: string;
  onHotelChange: (hotel: string) => void;
}

export const HabboHotelSelect: React.FC<HabboHotelSelectProps> = ({
  selectedHotel,
  onHotelChange
}) => {
  const hotels = [
    { code: 'br', name: 'Habbo BR', flag: '🇧🇷' },
    { code: 'com', name: 'Habbo USA', flag: '🇺🇸' },
    { code: 'es', name: 'Habbo ES', flag: '🇪🇸' },
    { code: 'fr', name: 'Habbo FR', flag: '🇫🇷' },
    { code: 'de', name: 'Habbo DE', flag: '🇩🇪' },
    { code: 'it', name: 'Habbo IT', flag: '🇮🇹' }
  ];

  return (
    <div className="mb-4">
      <Label htmlFor="hotel-select" className="text-sm font-medium text-gray-700 mb-1 block">
        Hotel
      </Label>
      <Select value={selectedHotel} onValueChange={onHotelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o hotel" />
        </SelectTrigger>
        <SelectContent>
          {hotels.map(hotel => (
            <SelectItem key={hotel.code} value={hotel.code}>
              {hotel.flag} {hotel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default HabboHotelSelect;
