// Componente para seleção de hotel
import React from 'react';
import { unifiedHabboApiService } from '@/services/unifiedHabboApiService';

interface HotelSelectorProps {
  selectedHotel: string;
  onHotelChange: (hotel: string) => void;
  disabled?: boolean;
  className?: string;
}

const HOTEL_OPTIONS = [
  { value: 'br', label: 'Brasil', flag: '🇧🇷', domain: 'habbo.com.br' },
  { value: 'com', label: 'Internacional', flag: '🇺🇸', domain: 'habbo.com' },
  { value: 'de', label: 'Alemanha', flag: '🇩🇪', domain: 'habbo.de' },
  { value: 'es', label: 'Espanha', flag: '🇪🇸', domain: 'habbo.es' },
  { value: 'fi', label: 'Finlândia', flag: '🇫🇮', domain: 'habbo.fi' },
  { value: 'fr', label: 'França', flag: '🇫🇷', domain: 'habbo.fr' },
  { value: 'it', label: 'Itália', flag: '🇮🇹', domain: 'habbo.it' },
  { value: 'nl', label: 'Holanda', flag: '🇳🇱', domain: 'habbo.nl' },
  { value: 'tr', label: 'Turquia', flag: '🇹🇷', domain: 'habbo.com.tr' }
];

export const HotelSelector: React.FC<HotelSelectorProps> = ({
  selectedHotel,
  onHotelChange,
  disabled = false,
  className = ''
}) => {
  const selectedOption = HOTEL_OPTIONS.find(option => option.value === selectedHotel);

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedHotel}
        onChange={(e) => onHotelChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-2 pr-8 rounded-lg border border-gray-300
          bg-white text-gray-700 appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        {HOTEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.flag} {option.label} ({option.domain})
          </option>
        ))}
      </select>
      
      {/* Ícone de dropdown */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      
      {/* Informações do hotel selecionado */}
      {selectedOption && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Hotel selecionado:</span> {selectedOption.flag} {selectedOption.label}
          <br />
          <span className="text-xs text-gray-500">Domínio: {selectedOption.domain}</span>
        </div>
      )}
    </div>
  );
};

// Hook para gerenciar estado do hotel
export const useHotelSelection = (initialHotel: string = 'br') => {
  const [selectedHotel, setSelectedHotel] = React.useState(initialHotel);
  const [isValidHotel, setIsValidHotel] = React.useState(true);

  React.useEffect(() => {
    const isValid = unifiedHabboApiService.isHotelSupported(selectedHotel);
    setIsValidHotel(isValid);
  }, [selectedHotel]);

  const changeHotel = React.useCallback((hotel: string) => {
    setSelectedHotel(hotel);
  }, []);

  const getHotelInfo = React.useCallback(() => {
    return HOTEL_OPTIONS.find(option => option.value === selectedHotel);
  }, [selectedHotel]);

  return {
    selectedHotel,
    changeHotel,
    isValidHotel,
    getHotelInfo,
    supportedHotels: HOTEL_OPTIONS
  };
};