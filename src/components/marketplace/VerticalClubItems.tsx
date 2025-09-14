import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditIcon } from './CreditIcon';
import { Package } from 'lucide-react';

interface ClubItem {
  id: string;
  name: string;
  price: number;
  className: string;
  type: 'hc' | 'ca';
  imageUrl: string;
  available: boolean;
}

interface VerticalClubItemsProps {
  hotel: string;
}

interface ClubItemImageProps {
  imageUrl: string;
  name: string;
  type: 'hc' | 'ca';
}

const ClubItemImage = ({ imageUrl, name, type }: ClubItemImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackImages = [
    imageUrl,
    type === 'hc' ? '/assets/HC.png' : '/assets/bc31.png',
    `https://images.habbo.com/dcr/hof_furni/br/${type === 'hc' ? 'hc_membership' : 'club_membership'}.png`,
    `https://habbofurni.com/furniture_images/${type === 'hc' ? 'hc_membership' : 'club_membership'}.png`
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageError = () => {
    if (currentImageIndex < fallbackImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    return (
      <div className="w-12 h-12 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
        <Package size={16} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded overflow-hidden flex items-center justify-center relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded"></div>
      )}
      <img
        src={fallbackImages[currentImageIndex]}
        alt={name}
        className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ imageRendering: 'pixelated' }}
        loading="eager"
      />
    </div>
  );
};

export const VerticalClubItems = ({ hotel }: VerticalClubItemsProps) => {
  const [clubItems, setClubItems] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubItems = async () => {
            try {
        setLoading(true);
        
        // Itens HC e CA com imagens diretas
        const mockItems: ClubItem[] = [
          {
            id: 'hc_31_days',
            name: '31 Dias HC',
            price: 25000,
            className: 'hc31',
            type: 'hc',
            imageUrl: '/assets/hc31.png',
            available: true
          },
          {
            id: 'ca_31_days', 
            name: '31 Dias CA',
            price: 30000,
            className: 'bc31',
            type: 'ca',
            imageUrl: '/assets/bc31.png',
            available: true
          }
        ];

        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setClubItems(mockItems);
              } catch (error) {
                setClubItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubItems();
  }, [hotel]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="w-16 h-12 bg-gray-200 animate-pulse rounded"></div>
        <div className="w-16 h-12 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clubItems.map((item) => (
        <Card 
          key={item.id} 
          className="w-20 border-2 hover:border-blue-400 transition-colors cursor-pointer"
          style={{ backgroundColor: item.type === 'hc' ? '#fef3c7' : '#f3e8ff' }}
        >
          <CardContent className="p-2 text-center">
            <ClubItemImage 
              imageUrl={item.imageUrl}
              name={item.name}
              type={item.type}
            />
            
            <div className="mt-1">
              <div className="text-xs font-bold text-gray-800 truncate">
                {item.type.toUpperCase()}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs">
                <CreditIcon size="sm" />
                <span className="font-semibold text-blue-600">
                  {(item.price / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
