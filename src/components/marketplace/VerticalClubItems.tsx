
import { useState, useEffect } from 'react';
import { CreditIcon } from './CreditIcon';
import { supabase } from '@/integrations/supabase/client';

interface ClubItem {
  id: string;
  name: string;
  price: number;
  available: number;
  icon: string;
  className: string;
}

interface VerticalClubItemsProps {
  hotel: string;
}

export const VerticalClubItems = ({ hotel }: VerticalClubItemsProps) => {
  const [clubItems, setClubItems] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClubPrices = async () => {
    try {
      setLoading(true);
      
      const hcPromise = supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm: 'hc_', 
          category: '',
          hotel: hotel,
          days: 7
        }
      });

      const bcPromise = supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm: 'bc_', 
          category: '',
          hotel: hotel,
          days: 7
        }
      });

      const [hcResponse, bcResponse] = await Promise.all([hcPromise, bcPromise]);

      let hcItem = null;
      let bcItem = null;

      if (!hcResponse.error && hcResponse.data?.items) {
        hcItem = hcResponse.data.items.find((item: any) => 
          item.className.toLowerCase().includes('hc') && 
          (item.name.toLowerCase().includes('31') || item.name.toLowerCase().includes('habbo club'))
        );
      }

      if (!bcResponse.error && bcResponse.data?.items) {
        bcItem = bcResponse.data.items.find((item: any) => 
          item.className.toLowerCase().includes('bc') && 
          (item.name.toLowerCase().includes('31') || item.name.toLowerCase().includes('builders'))
        );
      }

      const realItems: ClubItem[] = [
        {
          id: 'hc_premium_31',
          name: 'HC 31 Dias',
          price: hcItem?.currentPrice || 0,
          available: hcItem?.openOffers || 0,
          icon: '/assets/hc31.png',
          className: hcItem?.className || 'hc_premium'
        },
        {
          id: 'bc_premium_31', 
          name: 'CA 31 Dias',
          price: bcItem?.currentPrice || 0,
          available: bcItem?.openOffers || 0,
          icon: '/assets/bc31.png',
          className: bcItem?.className || 'bc_premium'
        }
      ];

      setClubItems(realItems);
    } catch (error) {
      console.error('Erro ao buscar preços de clube:', error);
      setClubItems([
        {
          id: 'hc_premium_31',
          name: 'HC 31 Dias',
          price: 0,
          available: 0,
          icon: '/assets/hc31.png',
          className: 'hc_premium'
        },
        {
          id: 'bc_premium_31',
          name: 'CA 31 Dias', 
          price: 0,
          available: 0,
          icon: '/assets/bc31.png',
          className: 'bc_premium'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubPrices();
  }, [hotel]);

  return (
    <div className="space-y-3">
      {clubItems.map((item) => (
        <div key={item.id} className="bg-white rounded-lg border-2 border-black p-4 text-center shadow-md">
          <div className="flex justify-center mb-3">
            <img 
              src={item.icon} 
              alt={item.name}
              className="w-12 h-12"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <p className="font-bold text-sm text-gray-800 mb-2">{item.name}</p>
          {item.available > 0 ? (
            <>
              <div className="flex items-center justify-center gap-1 mb-2">
                <CreditIcon size="md" />
                <span className={`font-bold text-lg ${loading ? 'animate-pulse text-gray-400' : 'text-green-600'}`}>
                  {loading ? '...' : item.price.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">{item.available} disponível</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1 mb-2">
                <CreditIcon size="md" />
                <span className="font-bold text-lg text-gray-400">-</span>
              </div>
              <div className="bg-red-100 border border-red-300 rounded px-3 py-1">
                <p className="text-sm text-red-600 font-medium">0 disponíveis</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
