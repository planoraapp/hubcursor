
interface CountryFlagsProps {
  hotelId: string;
  className?: string;
}

export const CountryFlags = ({ hotelId, className = '' }: CountryFlagsProps) => {
  const getFlagAsset = (hotel: string) => {
    const flagMap: Record<string, string> = {
      'br': '/assets/flagbrazil.png',
      'com': '/assets/flagcom.png', 
      'de': '/assets/flagdeus.png',
      'es': '/assets/flagspain.png',
      'fr': '/assets/flagfrance.png',
      'it': '/assets/flagitaly.png',
      'nl': '/assets/flagnetl.png',
      'fi': '/assets/flafinland.png',
      'tr': '/assets/flagtrky.png'
    };
    
    return flagMap[hotel] || '/assets/flagcom.png'; // fallback
  };

  return (
    <img 
      src={getFlagAsset(hotelId)}
      alt={`${hotelId.toUpperCase()} Flag`}
      className={`w-5 h-4 ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
