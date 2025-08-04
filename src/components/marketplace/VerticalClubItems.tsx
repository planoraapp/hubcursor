
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
      console.log('🔍 [VerticalClubItems] Fetching club prices for hotel:', hotel);
      
      // Buscar dados reais do mercado para HC e CA
      const marketResponse = await supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm: '',
          category: '',
          hotel: hotel,
          days: 7
        }
      });

      console.log('📊 [VerticalClubItems] Market response:', marketResponse);

      let hcItem = null;
      let caItem = null;

      if (!marketResponse.error && marketResponse.data?.items) {
        const items = marketResponse.data.items;
        console.log('🔍 [VerticalClubItems] Searching in', items.length, 'items');
        
        // Buscar HC 31 dias - múltiplas variações
        hcItem = items.find((item: any) => {
          const name = item.name?.toLowerCase() || '';
          const className = item.className?.toLowerCase() || '';
          
          return (
            (name.includes('31') && (name.includes('hc') || name.includes('habbo club'))) ||
            (name.includes('31') && name.includes('dias') && name.includes('hc')) ||
            (className.includes('hc_') && name.includes('31')) ||
            name.includes('31 dias hc') ||
            name.includes('hc 31') ||
            name.includes('habbo club 31')
          );
        });
        
        // Buscar CA/BC 31 dias - múltiplas variações  
        caItem = items.find((item: any) => {
          const name = item.name?.toLowerCase() || '';
          const className = item.className?.toLowerCase() || '';
          
          return (
            (name.includes('31') && (name.includes('ca') || name.includes('builders') || name.includes('bc'))) ||
            (name.includes('31') && name.includes('dias') && (name.includes('ca') || name.includes('bc'))) ||
            (className.includes('bc_') || className.includes('ca_')) && name.includes('31') ||
            name.includes('31 dias ca') ||
            name.includes('31 dias bc') ||
            name.includes('ca 31') ||
            name.includes('bc 31') ||
            name.includes('builders club 31')
          );
        });

        console.log('🔍 [VerticalClubItems] Found HC item:', hcItem);
        console.log('🔍 [VerticalClubItems] Found CA item:', caItem);
      }

      // Se não encontrou nos dados do mercado, tentar busca específica
      if (!hcItem || !caItem) {
        console.log('🔄 [VerticalClubItems] Trying specific searches...');
        
        const specificSearches = [
          'HC 31',
          '31 Dias HC',
          'Habbo Club 31',
          'CA 31', 
          '31 Dias CA',
          'BC 31',
          'Builders Club 31'
        ];

        for (const searchTerm of specificSearches) {
          const specificResponse = await supabase.functions.invoke('habbo-market-real', {
            body: { 
              searchTerm,
              category: '',
              hotel: hotel,
              days: 3
            }
          });

          if (!specificResponse.error && specificResponse.data?.items && specificResponse.data.items.length > 0) {
            const foundItems = specificResponse.data.items;
            console.log(`🔍 [VerticalClubItems] Search "${searchTerm}" found:`, foundItems.length, 'items');
            
            if (!hcItem && searchTerm.includes('HC')) {
              hcItem = foundItems[0]; // Pegar o primeiro resultado
            }
            
            if (!caItem && (searchTerm.includes('CA') || searchTerm.includes('BC'))) {
              caItem = foundItems[0]; // Pegar o primeiro resultado
            }
          }
        }
      }

      console.log('✅ [VerticalClubItems] Final HC Item:', hcItem);
      console.log('✅ [VerticalClubItems] Final CA Item:', caItem);

      const realItems: ClubItem[] = [
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: hcItem?.currentPrice || hcItem?.price || 0,
          available: hcItem?.openOffers || hcItem?.quantity || hcItem?.available || 0,
          icon: '/assets/hc31.png',
          className: hcItem?.className || 'hc_premium'
        },
        {
          id: 'ca_premium_31', 
          name: '31 Dias CA',
          price: caItem?.currentPrice || caItem?.price || 0,
          available: caItem?.openOffers || caItem?.quantity || caItem?.available || 0,
          icon: '/assets/bc31.png',
          className: caItem?.className || 'bc_premium'
        }
      ];

      console.log('🎯 [VerticalClubItems] Final items:', realItems);
      setClubItems(realItems);
    } catch (error) {
      console.error('❌ [VerticalClubItems] Error fetching club prices:', error);
      // Fallback com dados básicos
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
              className="w-10 h-10 flex-shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="font-bold text-sm text-white min-w-0 flex-shrink-0 volter-font" style={{
              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
            }}>
              {item.name}
            </span>
            <div className="flex items-center gap-1">
              <CreditIcon size="sm" />
              <span className={`font-bold text-sm volter-font ${loading ? 'animate-pulse text-gray-400' : 'text-white'}`} style={{
                textShadow: loading ? 'none' : '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
              }}>
                {loading ? '...' : (item.price > 0 ? item.price.toLocaleString() : '-')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
