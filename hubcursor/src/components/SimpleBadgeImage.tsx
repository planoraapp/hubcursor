import { useState, useEffect } from 'react';

interface SimpleBadgeImageProps {
  code: string;
  className?: string;
}

const SimpleBadgeImage = ({ code, className = '' }: SimpleBadgeImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  
  // Prioritized URLs: Supabase bucket first, then fallbacks
  const getBadgeUrls = (badgeCode: string) => [
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${badgeCode}.gif`,
    `https://habboassets.com/c_images/album1584/${badgeCode}.gif`,
    `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
    `https://habboassets.s3.amazonaws.com/c_images/album1584/${badgeCode}.gif`
  ];

  const badgeUrls = getBadgeUrls(code);
  const currentUrl = badgeUrls[currentUrlIndex];

  const handleImageError = () => {
    if (currentUrlIndex < badgeUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  // Reset when code changes
  useEffect(() => {
    setImageError(false);
    setCurrentUrlIndex(0);
  }, [code]);

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-xs text-gray-400 ${className}`}>
        ?
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={code}
      className={`object-contain ${className}`}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default SimpleBadgeImage;