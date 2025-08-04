
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
      
      // Buscar dados reais do mercado para HC e CA
      const marketResponse = await supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm: '',
          category: '',
          hotel: hotel,
          days: 7
        }
      });

      let hcItem = null;
      let caItem = null;

      if (!marketResponse.error && marketResponse.data?.items) {
        const items = marketResponse.data.items;
        
        // Buscar HC 31 dias
        hcItem = items.find((item: any) => 
          (item.name.toLowerCase().includes('31') && 
           (item.name.toLowerCase().includes('hc') || 
            item.name.toLowerCase().includes('habbo club'))) ||
          (item.className && item.className.toLowerCase().includes('hc_') && 
           item.name.toLowerCase().includes('31'))
        );
        
        // Buscar CA/BC 31 dias
        caItem = items.find((item: any) => 
          (item.name.toLowerCase().includes('31') && 
           (item.name.toLowerCase().includes('ca') || 
            item.name.toLowerCase().includes('builders') ||
            item.name.toLowerCase().includes('bc'))) ||
          (item.className && 
           (item.className.toLowerCase().includes('bc_') || 
            item.className.toLowerCase().includes('ca_')) && 
           item.name.toLowerCase().includes('31'))
        );
      }

      // Se não encontrou nos dados do mercado, tentar busca específica
      if (!hcItem || !caItem) {
        const specificSearches = [
          '31 Dias HC',
          'HC 31 dias', 
          'Habbo Club 31',
          '31 Dias CA',
          'CA 31 dias',
          'Builders Club 31',
          'BC 31 dias'
        ];

        for (const searchTerm of specificSearches) {
          const specificResponse = await supabase.functions.invoke('habbo-market-real', {
            body: { 
              searchTerm,
              category: '',
              hotel: hotel,
              days: 7
            }
          });

          if (!specificResponse.error && specificResponse.data?.items) {
            const foundItems = specificResponse.data.items;
            
            if (!hcItem && (searchTerm.toLowerCase().includes('hc') || searchTerm.toLowerCase().includes('habbo'))) {
              hcItem = foundItems.find((item: any) => 
                item.name.toLowerCase().includes('31') && 
                (item.name.toLowerCase().includes('hc') || item.name.toLowerCase().includes('habbo'))
              );
            }
            
            if (!caItem && (searchTerm.toLowerCase().includes('ca') || searchTerm.toLowerCase().includes('bc') || searchTerm.toLowerCase().includes('builders'))) {
              caItem = foundItems.find((item: any) => 
                item.name.toLowerCase().includes('31') && 
                (item.name.toLowerCase().includes('ca') || 
                 item.name.toLowerCase().includes('bc') || 
                 item.name.toLowerCase().includes('builders'))
              );
            }
          }
        }
      }

      console.log('🔍 HC Item found:', hcItem);
      console.log('🔍 CA Item found:', caItem);

      const realItems: ClubItem[] = [
        {
          id: 'hc_premium_31',
          name: '31 Dias HC',
          price: hcItem?.currentPrice || 0,
          available: hcItem?.openOffers || hcItem?.quantity || 0,
          icon: '/assets/hc31.png',
          className: hcItem?.className || 'hc_premium'
        },
        {
          id: 'ca_premium_31', 
          name: '31 Dias CA',
          price: caItem?.currentPrice || 0,
          available: caItem?.openOffers || caItem?.quantity || 0,
          icon: '/assets/bc31.png',
          className: caItem?.className || 'bc_premium'
        }
      ];

      setClubItems(realItems);
    } catch (error) {
      console.error('❌ Erro ao buscar preços de clube:', error);
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
                {loading ? '...' : (item.available > 0 ? item.price.toLocaleString() : '-')}
              </span>
            </div>
          </div>
          
          {/* Linha de baixo para aviso de zero disponíveis */}
          {item.available === 0 && !loading && (
            <div className="mt-2 ml-13">
              <div className="bg-red-500 border-2 border-black rounded px-3 py-1 inline-block">
                <span className="text-xs text-white font-bold volter-font" style={{
                  textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                }}>
                  0 disponíveis
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
