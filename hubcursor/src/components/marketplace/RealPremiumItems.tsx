
import { useState, useEffect } from 'react';
import { CreditIcon } from './CreditIcon';
import { supabase } from '@/integrations/supabase/client';

interface PremiumItem {
  id: string;
  name: string;
  price: number;
  available: number;
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
      
      // Buscar especificamente por HC e BC
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

      // Processar HC
      if (!hcResponse.error && hcResponse.data?.items) {
        hcItem = hcResponse.data.items.find((item: any) => 
          item.className.toLowerCase().includes('hc') && 
          (item.name.toLowerCase().includes('31') || item.name.toLowerCase().includes('habbo club'))
        );
      }

      // Processar BC
      if (!bcResponse.error && bcResponse.data?.items) {
        bcItem = bcResponse.data.items.find((item: any) => 
          item.className.toLowerCase().includes('bc') && 
          (item.name.toLowerCase().includes('31') || item.name.toLowerCase().includes('builders'))
        );
      }

      const realItems: PremiumItem[] = [
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: hcItem?.currentPrice || 0,
          available: hcItem?.openOffers || 0,
          icon: '/assets/hc31.png',
          className: hcItem?.className || 'hc_premium'
        },
        {
          id: 'bc_premium_31', 
          name: '31 Dias BC',
          price: bcItem?.currentPrice || 0,
          available: bcItem?.openOffers || 0,
          icon: '/assets/bc31.png',
          className: bcItem?.className || 'bc_premium'
        }
      ];

      setPremiumItems(realItems);
    } catch (error) {
      console.error('Erro ao buscar preços reais:', error);
      // Fallback com zero disponível
      setPremiumItems([
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: 0,
          available: 0,
          icon: '/assets/hc31.png',
          className: 'hc_premium'
        },
        {
          id: 'bc_premium_31',
          name: '31 Dias BC', 
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
    fetchRealPrices();
  }, [hotel]);

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h4 className="font-bold text-gray-800 mb-3 text-sm">🏆 Assinaturas Premium</h4>
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
            {item.available > 0 ? (
              <>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CreditIcon size="sm" />
                  <span className={`font-bold text-sm ${loading ? 'animate-pulse text-gray-400' : 'text-green-600'}`}>
                    {loading ? '...' : item.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{item.available} disponível</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CreditIcon size="sm" />
                  <span className="font-bold text-sm text-gray-400">-</span>
                </div>
                <p className="text-xs text-red-500">0 disponíveis</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
