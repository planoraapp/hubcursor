
interface CountryFlagsProps {
  hotelId: string;
  className?: string;
}

export const CountryFlags = ({ hotelId, className = '' }: CountryFlagsProps) => {
  const getFlagAsset = (hotel: string) => {
    const flagMap: Record<string, string> = {
      'br': '/flags/flagbrazil.png',
      'com': '/flags/flagcom.png', 
      'de': '/flags/flagdeus.png',
      'es': '/flags/flagspain.png',
      'fr': '/flags/flagfrance.png',
      'it': '/flags/flagitaly.png',
      'nl': '/flags/flagnetl.png',
      'fi': '/flags/flafinland.png',
      'tr': '/flags/flagtrky.png'
    };
    
    return flagMap[hotel] || '/flags/flagcom.png'; // fallback
  };

  return (
    <img 
      src={getFlagAsset(hotelId)}
      alt={`${hotelId.toUpperCase()} Flag`}
      className={className || 'w-5 h-4'}
      style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
    />
  );
};
