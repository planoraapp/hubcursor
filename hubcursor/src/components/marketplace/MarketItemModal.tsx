
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HabboAPIImage } from './HabboAPIImage';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2, Clock, Zap } from 'lucide-react';
import { HabboAPIService } from '@/services/HabboAPIService';
import type { MarketItem } from '@/contexts/MarketplaceContext';

interface MarketItemModalProps {
  item: MarketItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MarketItemModal = ({ item, open, onOpenChange }: MarketItemModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HabboAPIImage
              className={item.className}
              name={item.name}
              size="lg"
            />
            {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-2">
              <CreditIcon size="lg" />
              {HabboAPIService.formatPrice(item.currentPrice)} créditos
            </div>
            
            {item.trend !== 'stable' && (
              <div className="flex items-center justify-center gap-1">
                {item.trend === 'up' ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span className={`text-sm ${
                  item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.changePercent}%
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold">Categoria:</div>
              <div>{HabboAPIService.getCategoryTranslation(item.category)}</div>
            </div>
            <div>
              <div className="font-semibold">Raridade:</div>
              <div className="capitalize">{item.rarity}</div>
            </div>
            <div>
              <div className="font-semibold">Volume:</div>
              <div>{item.volume}</div>
            </div>
            <div>
              <div className="font-semibold">Ofertas:</div>
              <div>{item.openOffers || 'N/A'}</div>
            </div>
          </div>
          
          {item.description && (
            <div>
              <div className="font-semibold text-sm mb-1">Descrição:</div>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={12} />
              Última atualização: {new Date(item.lastUpdated).toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Zap size={12} />
              Dados da HabboAPI.site
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
