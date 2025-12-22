import React, { useState, useEffect, useRef } from 'react';
import { HOTEL_COUNTRIES } from '@/utils/hotelHelpers';
import { cn } from '@/lib/utils';

interface CountryDropdownProps {
  selectedCountry: string | null;
  onCountrySelect: (countryCode: string | null) => void;
  className?: string;
}

export const CountryDropdown: React.FC<CountryDropdownProps> = ({
  selectedCountry,
  onCountrySelect,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const selectedCountryData = selectedCountry 
    ? HOTEL_COUNTRIES.find(c => c.code === selectedCountry)
    : null;

  return (
    <div className={cn("relative country-dropdown z-10", className)} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "flex items-center justify-center transition-colors border-r border-white/30 relative z-20 h-full",
          selectedCountry 
            ? 'px-1 min-w-[50px]' 
            : 'px-2 min-w-[35px] text-white hover:bg-white/10'
        )}
        title={selectedCountryData?.name || 'Selecionar país'}
      >
        {selectedCountry ? (
          <img
            src={selectedCountryData?.flag}
            alt=""
            className="h-5 w-auto object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <img
            src="/assets/console/hotelfilter.png"
            alt="Filtro"
            className="h-6 w-auto object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div 
          className="absolute top-full left-0 mt-1 border border-black rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
            backgroundSize: '100% 2px'
          }}
        >
          <div className="bg-gray-900 p-1">
            <button
              onClick={() => {
                onCountrySelect(null);
                setShowDropdown(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors flex items-center gap-2",
                !selectedCountry ? 'bg-white/10' : 'text-white'
              )}
            >
              <span className="text-white/60">Todos os países</span>
            </button>
            {HOTEL_COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  onCountrySelect(country.code);
                  setShowDropdown(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors flex items-center gap-2",
                  selectedCountry === country.code ? 'bg-white/10' : 'text-white'
                )}
              >
                <img
                  src={country.flag}
                  alt={country.name}
                  className="w-6 h-6 object-contain flex-shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

