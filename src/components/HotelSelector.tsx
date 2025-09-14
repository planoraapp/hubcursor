import React from 'react';
import { getAvailableHotels } from '@/utils/usernameUtils';

interface HotelSelectorProps {
  selectedHotel: string;
  onHotelChange: (hotel: string) => void;
  className?: string;
}

export const HotelSelector: React.FC<HotelSelectorProps> = ({
  selectedHotel,
  onHotelChange,
  className = ''
}) => {
  const hotels = getAvailableHotels();

  return (
    <div className={`hotel-selector ${className}`}>
      <label htmlFor="hotel-select" className="block text-sm font-medium text-gray-700 mb-2">
        Hotel:
      </label>
      <select
        id="hotel-select"
        value={selectedHotel}
        onChange={(e) => onHotelChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {hotels.map((hotel) => (
          <option key={hotel.code} value={hotel.code}>
            {hotel.name} ({hotel.domain})
          </option>
        ))}
      </select>
    </div>
  );
};