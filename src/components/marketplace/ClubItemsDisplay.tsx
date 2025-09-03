
import { Card, CardContent } from '@/components/ui/card';
import { CreditIcon } from './CreditIcon';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useState, useEffect } from 'react';
import { HabboAPIService } from '@/services/HabboAPIService';

interface RealClubItem {
  id: string;
  name: string;
  price: number;
  available: number;
  type: 'hc' | 'ca';
  imageUrl: string;
  className: string;
}

export const ClubItemsDisplay = () => {
  const { state } = useMarketplace();
  const { loading: contextLoading, selectedHotel } = state;
  const [clubItems, setClubItems] = useState<RealClubItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRealClubPrices = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando preços reais de HC e CA...');

      // Buscar itens HC e CA de 31 dias
      const hcData = await HabboAPIService.fetchMarketData({
        searchTerm: 'hc_',
        category: '',
        hotel: selectedHotel,
        days: 7
      });

      const caData = await HabboAPIService.fetchMarketData({
        searchTerm: 'bc_',
        category: '',
        hotel: selectedHotel,
        days: 7
      });

      // Encontrar itens de 31 dias
      let hcItem = null;
      let caItem = null;

      if (hcData?.items) {
        hcItem = hcData.items.find(item => 
          item.name.toLowerCase().includes('31') || 
          item.className.toLowerCase().includes('hc') && item.currentPrice > 0
        );
      }

      if (caData?.items) {
        caItem = caData.items.find(item => 
          item.name.toLowerCase().includes('31') || 
          item.className.toLowerCase().includes('bc') && item.currentPrice > 0
        );
      }

      const realClubItems: RealClubItem[] = [
        {
          id: 'hc_31_days',
          name: '31 Dias HC',
          price: hcItem?.currentPrice || 0,
          available: hcItem?.openOffers || 0,
          type: 'hc',
          imageUrl: '/assets/HC.png',
          className: hcItem?.className || 'hc_premium'
        },
        {
          id: 'ca_31_days', 
          name: '31 Dias CA',
          price: caItem?.currentPrice || 0,
          available: caItem?.openOffers || 0,
          type: 'ca',
          imageUrl: '/assets/bc31.png',
          className: caItem?.className || 'bc_premium'
        }
      ];

      setClubItems(realClubItems);
      console.log('✅ Preços de clube atualizados:', realClubItems);
      
    } catch (error) {
      console.error('❌ Erro ao buscar preços de clube:', error);
      // Fallback com dados básicos
      setClubItems([
        {
          id: 'hc_31_days',
          name: '31 Dias HC',
          price: 0,
          available: 0,
          type: 'hc',
          imageUrl: '/assets/HC.png',
          className: 'hc_premium'
        },
        {
          id: 'ca_31_days',
          name: '31 Dias CA', 
          price: 0,
          available: 0,
          type: 'ca',
          imageUrl: '/assets/bc31.png',
          className: 'bc_premium'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHotel) {
      fetchRealClubPrices();
    }
  }, [selectedHotel]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !contextLoading) {
        fetchRealClubPrices();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loading, contextLoading]);

  if (contextLoading || loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="w-full h-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="w-full h-24 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {clubItems.map((item) => (
        <Card 
          key={item.id} 
          className="border-2 hover:border-blue-400 transition-colors cursor-pointer"
          style={{ backgroundColor: item.type === 'hc' ? '#fef3c7' : '#f3e8ff' }}
        >
          <CardContent className="p-3 text-center">
            <div className="mb-2">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-12 h-12 mx-auto object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/HC.png';
                }}
              />
            </div>
            
            <div className="text-xs font-bold text-gray-800 mb-1">
              {item.name}
            </div>
            
            {item.available > 0 ? (
              <>
                <div className="flex items-center justify-center gap-1 text-xs mb-1">
                  <CreditIcon size="sm" />
                  <span className="font-semibold text-green-600">
                    {item.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {item.available} disponível{item.available !== 1 ? 'eis' : ''}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1 text-xs mb-1">
                  <CreditIcon size="sm" />
                  <span className="font-semibold text-gray-400">--</span>
                </div>
                <div className="text-xs text-red-500">
                  Sem ofertas
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
