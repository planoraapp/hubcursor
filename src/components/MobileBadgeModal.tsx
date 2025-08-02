
import { useEffect } from 'react';
import { X, Award, Star } from 'lucide-react';
import IntelligentBadgeImage from './IntelligentBadgeImage';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rarity: string;
}

interface MobileBadgeModalProps {
  badge: BadgeItem;
  onClose: () => void;
}

export const MobileBadgeModal = ({ badge, onClose }: MobileBadgeModalProps) => {
  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fechar com swipe para baixo (simplificado)
  const handleTouchStart = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endY = endEvent.changedTouches[0].clientY;
      const deltaY = endY - startY;
      
      // Se arrastou para baixo mais de 100px, fechar
      if (deltaY > 100) {
        onClose();
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-400';
      case 'rare': return 'from-purple-400 to-pink-400';
      case 'uncommon': return 'from-blue-400 to-indigo-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'Lendário';
      case 'rare': return 'Raro';
      case 'uncommon': return 'Incomum';
      default: return 'Comum';
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'staff': 'Equipe',
      'conquistas': 'Conquistas',
      'eventos': 'Eventos',
      'especiais': 'Especiais',
      'jogos': 'Jogos',
      'gerais': 'Gerais'
    };
    return names[category] || category;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-end z-50">
      {/* Modal content */}
      <div 
        className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto"
        onTouchStart={handleTouchStart}
      >
        {/* Handle bar para indicar que pode arrastar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start p-6 pb-4">
          <h3 className="text-2xl font-bold text-gray-800 flex-1 pr-4">
            {badge.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Badge Display */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className={`inline-block p-6 bg-gradient-to-br ${getRarityColor(badge.rarity)} rounded-2xl shadow-2xl`}>
              <IntelligentBadgeImage
                code={badge.code}
                name={badge.name}
                size="lg"
                className="w-20 h-20"
              />
            </div>
          </div>
          
          {/* Badge Info */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-lg font-mono font-semibold">
                {badge.code}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-gray-600 text-sm">Categoria</span>
                <div className="font-semibold text-gray-800 capitalize">
                  {getCategoryName(badge.category)}
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-gray-600 text-sm">Raridade</span>
                <div className={`font-semibold capitalize flex items-center gap-2 ${
                  badge.rarity === 'legendary' ? 'text-yellow-600' :
                  badge.rarity === 'rare' ? 'text-purple-600' :
                  badge.rarity === 'uncommon' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  <Star size={16} className="fill-current" />
                  {getRarityText(badge.rarity)}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl">
              <span className="text-blue-800 font-semibold text-sm block mb-2">Descrição</span>
              <p className="text-gray-700 leading-relaxed">
                {badge.description}
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <Award size={20} />
              <span className="font-semibold">Emblema Oficial do Habbo</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Arraste para baixo para fechar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
