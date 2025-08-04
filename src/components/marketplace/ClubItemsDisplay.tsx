import { Card, CardContent } from '@/components/ui/card';
import { CreditIcon } from './CreditIcon';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { MarketplaceService } from '@/services/MarketplaceService';

export const ClubItemsDisplay = () => {
  const { state } = useMarketplace();
  const { clubItems, loading } = state;

  if (loading) {
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
                  target.src = '/assets/credits_icon.gif'; // Fallback
                }}
              />
            </div>
            
            <div className="text-xs font-bold text-gray-800 mb-1">
              {item.type.toUpperCase()}
            </div>
            
            <div className="flex items-center justify-center gap-1 text-xs">
              <CreditIcon size="sm" />
              <span className="font-semibold text-blue-600">
                {MarketplaceService.formatPrice(item.price)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};