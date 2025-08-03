
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
      
      // Buscar especificamente por "31 Dias HC" e "31 Dias CA"
      const hcPromise = supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm: '31 Dias HC', 
          category: '',
          hotel: hotel,
          days: 7
        }
      });

      const caPromise = supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm: '31 Dias CA', 
          category: '',
          hotel: hotel,
          days: 7
        }
      });

      const [hcResponse, caResponse] = await Promise.all([hcPromise, caPromise]);

      let hcItem = null;
      let caItem = null;

      // Processar HC
      if (!hcResponse.error && hcResponse.data?.items) {
        hcItem = hcResponse.data.items.find((item: any) => 
          item.name.toLowerCase().includes('31 dias hc') || 
          item.name.toLowerCase().includes('habbo club')
        );
      }

      // Processar CA
      if (!caResponse.error && caResponse.data?.items) {
        caItem = caResponse.data.items.find((item: any) => 
          item.name.toLowerCase().includes('31 dias ca') || 
          item.name.toLowerCase().includes('builders')
        );
      }

      const realItems: ClubItem[] = [
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: hcItem?.currentPrice || 0,
          available: hcItem?.openOffers || 0,
          icon: '/assets/hc31.png',
          className: hcItem?.className || 'hc_premium'
        },
        {
          id: 'ca_premium_31', 
          name: '31 Dias CA',
          price: caItem?.currentPrice || 0,
          available: caItem?.openOffers || 0,
          icon: '/assets/bc31.png',
          className: caItem?.className || 'bc_premium'
        }
      ];

      setClubItems(realItems);
    } catch (error) {
      console.error('Erro ao buscar preços de clube:', error);
      // Fallback com zero disponível
      setClubItems([
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: 0,
          available: 0,
          icon: '/assets/hc31.png',
          className: 'hc_premium'
        },
        {
          id: 'ca_premium_31',
          name: '31 Dias CA', 
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
    <div className="space-y-2">
      {clubItems.map((item) => (
        <div key={item.id} className="bg-transparent p-2">
          {/* Layout Horizontal: Ícone - Nome - Moeda - Preço */}
          <div className="flex items-center gap-3">
            <img 
              src={item.icon} 
              alt={item.name}
              className="w-8 h-8 flex-shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="font-bold text-sm text-gray-800 min-w-0 flex-shrink-0">
              {item.name}
            </span>
            <div className="flex items-center gap-1">
              <CreditIcon size="sm" />
              <span className={`font-bold text-sm ${loading ? 'animate-pulse text-gray-400' : 'text-green-600'}`}>
                {loading ? '...' : (item.available > 0 ? item.price.toLocaleString() : '-')}
              </span>
            </div>
          </div>
          
          {/* Linha de baixo para aviso de zero disponíveis */}
          {item.available === 0 && (
            <div className="mt-1 ml-11">
              <div className="bg-red-100 border border-red-300 rounded px-2 py-1 inline-block">
                <span className="text-xs text-red-600 font-medium">0 disponíveis</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
