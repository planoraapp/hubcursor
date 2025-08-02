import { useState } from 'react';

interface SimpleBadgeImageProps {
  code: string;
  className?: string;
}

const SimpleBadgeImage = ({ code, className = '' }: SimpleBadgeImageProps) => {
  const [imageError, setImageError] = useState(false);
  
  const badgeUrl = `https://habboassets.com/c_images/album1584/${code}.gif`;

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-xs text-gray-400 ${className}`}>
        ?
      </div>
    );
  }

  return (
    <img
      src={badgeUrl}
      alt={code}
      className={`object-contain ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default SimpleBadgeImage;