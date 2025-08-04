
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditIcon } from './CreditIcon';
import OptimizedFurniImage from './OptimizedFurniImage';

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

export const VerticalClubItems = ({ hotel }: VerticalClubItemsProps) => {
  const [clubItems, setClubItems] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubItems = async () => {
      console.log(`🏨 [VerticalClubItems] Fetching club items for hotel: ${hotel}`);
      
      try {
        setLoading(true);
        
        // Simular busca por itens HC e CA específicos
        const mockItems: ClubItem[] = [
          {
            id: 'hc_31_days',
            name: '31 Dias HC',
            price: 25000,
            className: 'hc_membership_31',
            type: 'hc',
            imageUrl: 'https://habbofurni.com/furniture_images/hc_membership_31.png',
            available: true
          },
          {
            id: 'ca_31_days', 
            name: '31 Dias CA',
            price: 30000,
            className: 'club_membership_31',
            type: 'ca',
            imageUrl: 'https://habbofurni.com/furniture_images/club_membership_31.png',
            available: true
          }
        ];

        // Aguardar um pouco para simular requisição
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setClubItems(mockItems);
        console.log(`✅ [VerticalClubItems] Loaded ${mockItems.length} club items`);
      } catch (error) {
        console.error('❌ [VerticalClubItems] Error fetching club items:', error);
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
            <OptimizedFurniImage
              className={item.className}
              name={item.name}
              hotel={hotel}
              size="sm"
              priority={true}
            />
            
            <div className="mt-1">
              <div className="text-xs font-bold text-gray-800 truncate">
                {item.type.toUpperCase()}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs">
                <CreditIcon size="xs" />
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
