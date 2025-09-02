import React from 'react';

interface CountryFlagProps {
  hotel: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ hotel, className = "" }) => {
  const getFlagData = (hotel: string) => {
    switch (hotel) {
      case 'br':
      case 'com.br':
        return { src: '/flags/br.png', alt: 'Brasil', country: 'Brasil' };
      case 'com':
        return { src: '/flags/us.png', alt: 'Estados Unidos', country: 'Estados Unidos' };
      case 'es':
        return { src: '/flags/es.png', alt: 'Espanha', country: 'Espanha' };
      case 'fi':
        return { src: '/flags/fi.png', alt: 'Finlândia', country: 'Finlândia' };
      case 'fr':
        return { src: '/flags/fr.png', alt: 'França', country: 'França' };
      case 'de':
        return { src: '/flags/de.png', alt: 'Alemanha', country: 'Alemanha' };
      case 'it':
        return { src: '/flags/it.png', alt: 'Itália', country: 'Itália' };
      case 'nl':
        return { src: '/flags/nl.png', alt: 'Holanda', country: 'Holanda' };
      case 'tr':
        return { src: '/flags/tr.png', alt: 'Turquia', country: 'Turquia' };
      default:
        return { src: '/flags/br.png', alt: 'Brasil', country: 'Brasil' };
    }
  };

  const flagData = getFlagData(hotel);

  return (
    <img 
      src={flagData.src} 
      alt={flagData.alt}
      title={flagData.country}
      className={`w-6 h-4 object-cover rounded-sm shadow-lg border border-white/20 ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/flags/br.png';
      }}
    />
  );
};