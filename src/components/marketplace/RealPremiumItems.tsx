
import { useState, useEffect } from 'react';
import { CreditIcon } from './CreditIcon';
import { supabase } from '@/integrations/supabase/client';

interface PremiumItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  className: string;
}

interface RealPremiumItemsProps {
  hotel: string;
}

export const RealPremiumItems = ({ hotel }: RealPremiumItemsProps) => {
  const [premiumItems, setPremiumItems] = useState<PremiumItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRealPrices = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm: 'habbo club', 
          category: '',
          hotel: hotel,
          days: 7
        }
      });

      if (error) throw error;

      const items = data?.items || [];
      const hcItem = items.find((item: any) => 
        item.className.toLowerCase().includes('hc') || 
        item.name.toLowerCase().includes('habbo club') ||
        item.name.toLowerCase().includes('31 dias')
      );
      
      const bcItem = items.find((item: any) => 
        item.className.toLowerCase().includes('bc') || 
        item.name.toLowerCase().includes('builders club') ||
        item.name.toLowerCase().includes('arquiteto')
      );

      const realItems = [
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: hcItem?.currentPrice || 650,
          icon: '/assets/hc31.png',
          className: hcItem?.className || 'hc_premium'
        },
        {
          id: 'bc_premium_31', 
          name: '31 Dias BC',
          price: bcItem?.currentPrice || 450,
          icon: '/assets/bc31.png',
          className: bcItem?.className || 'bc_premium'
        }
      ];

      setPremiumItems(realItems);
    } catch (error) {
      console.error('Erro ao buscar preços reais:', error);
      // Fallback com preços estimados
      setPremiumItems([
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: 650,
          icon: '/assets/hc31.png',
          className: 'hc_premium'
        },
        {
          id: 'bc_premium_31',
          name: '31 Dias BC', 
          price: 450,
          icon: '/assets/bc31.png',
          className: 'bc_premium'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealPrices();
  }, [hotel]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {premiumItems.map((item) => (
        <div key={item.id} className="bg-white rounded-lg border-2 border-yellow-300 p-3 text-center hover:shadow-md transition-all">
          <div className="flex justify-center mb-2">
            <img 
              src={item.icon} 
              alt={item.name}
              className="w-8 h-8"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <p className="font-medium text-xs text-gray-800 mb-1">{item.name}</p>
          <div className="flex items-center justify-center gap-1">
            <CreditIcon size="sm" />
            <span className={`font-bold text-sm ${loading ? 'animate-pulse text-gray-400' : 'text-green-600'}`}>
              {loading ? '...' : item.price.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
