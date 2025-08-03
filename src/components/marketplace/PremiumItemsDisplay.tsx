
import { CreditIcon } from './CreditIcon';
import RealFurniImageHybrid from './RealFurniImageHybrid';

interface PremiumItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  className: string;
}

interface PremiumItemsDisplayProps {
  hotel: string;
}

export const PremiumItemsDisplay = ({ hotel }: PremiumItemsDisplayProps) => {
  // Fixed premium items with estimated prices (will be replaced with real API data later)
  const premiumItems: PremiumItem[] = [
    {
      id: 'hc_premium_31',
      name: '31 Dias de HC',
      price: 650,
      icon: '/assets/HC.png',
      className: 'hc_premium'
    },
    {
      id: 'ca_premium_31', 
      name: '31 Dias de CA',
      price: 450,
      icon: '/assets/HC.png', // Will use HC icon for now, can be replaced later
      className: 'ca_premium'
    }
  ];

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
              />
            </div>
            <p className="font-medium text-xs text-gray-800 mb-1">{item.name}</p>
            <div className="flex items-center justify-center gap-1">
              <CreditIcon size="sm" />
              <span className="font-bold text-sm text-green-600">
                {item.price.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
