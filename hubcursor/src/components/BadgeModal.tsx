import React from 'react';
import { X } from 'lucide-react';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  imageUrl: string;
  rarity: string;
  source: string;
}

interface BadgeModalProps {
  badge: BadgeItem;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
  // Fechar modal ao clicar fora
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getCategoryName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'official': 'Emblemas Oficiais',
      'achievements': 'Conquistas',
      'fansites': 'Fansites',
      'others': 'Outros'
    };
    return categoryNames[category] || 'Categoria Desconhecida';
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'limited': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'super_rare': return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getRarityText = (rarity: string): string => {
    switch (rarity) {
      case 'limited': return 'Limitado';
      case 'super_rare': return 'Super Raro';
      case 'rare': return 'Raro';
      default: return 'Comum';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 truncate">
            {badge.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Badge Image */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="w-20 h-20 pixelated"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/203__-100.png';
                }}
              />
              {/* Rarity indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getRarityColor(badge.rarity)} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">
                  {badge.rarity === 'limited' ? 'L' : badge.rarity === 'super_rare' ? 'SR' : badge.rarity === 'rare' ? 'R' : 'C'}
                </span>
              </div>
            </div>
          </div>

          {/* Badge Details */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Código:</label>
              <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-sm break-all">
                {badge.code}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Categoria:</label>
              <div className="mt-1 text-sm text-gray-900">
                {getCategoryName(badge.category)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Raridade:</label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getRarityColor(badge.rarity)}`}>
                  {getRarityText(badge.rarity)}
                </span>
              </div>
            </div>

            {badge.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Descrição:</label>
                <div className="mt-1 text-sm text-gray-900">
                  {badge.description}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Emblema Oficial do Habbo Hotel
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Fonte: {badge.source}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};