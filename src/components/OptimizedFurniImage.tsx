import { useState } from 'react';
import { Package } from 'lucide-react';

interface OptimizedFurniImageProps {
  name: string;
  className?: string;
}

const OptimizedFurniImage = ({ name, className = '' }: OptimizedFurniImageProps) => {
  const [imageError, setImageError] = useState(false);
  
  // URL direta e simples do HabboWidgets
  const furniUrl = `https://habbowidgets.com/images/furni/${name}.gif`;

  if (imageError) {
    return (
      <div className={`bg-gray-50 flex items-center justify-center ${className}`}>
        <Package className="w-4 h-4 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={furniUrl}
      alt={name}
      className={`object-contain ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default OptimizedFurniImage;