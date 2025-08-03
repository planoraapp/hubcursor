
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Award, Palette, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface ToolsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export const ToolsPopover: React.FC<ToolsPopoverProps> = ({ isOpen, onClose, currentPath }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const toolsItems = [
    { id: 'catalogo', label: t('catalogo'), icon: Package, path: '/catalogo' },
    { id: 'emblemas', label: t('emblemas'), icon: Award, path: '/emblemas' },
    { id: 'editor', label: t('editor'), icon: Palette, path: '/editor' },
    { id: 'mercado', label: t('mercado'), icon: ShoppingCart, path: '/mercado' },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-72">
      <div 
        className="p-4 rounded-xl shadow-2xl"
        style={{
          backgroundColor: '#2a2a2a',
          border: '3px solid #d4af37',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #333 50%, #2a2a2a 100%)'
        }}
      >
        {/* Header */}
        <div className="text-center pb-3 border-b border-amber-600/30">
          <span 
            className="font-bold text-lg text-yellow-300 volter-font"
            style={{ 
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
            }}
          >
            Ferramentas
          </span>
        </div>

        {/* Grid de ferramentas */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {toolsItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: isActive 
                    ? 'rgba(212, 175, 55, 0.3)' 
                    : 'rgba(212, 175, 55, 0.1)',
                  border: `2px solid ${isActive ? '#f4d03f' : '#d4af37'}`,
                  boxShadow: isActive 
                    ? '0 0 10px rgba(244, 208, 63, 0.5)' 
                    : '0 2px 5px rgba(0, 0, 0, 0.2)'
                }}
                onClick={() => handleItemClick(item.path)}
              >
                <item.icon className="w-6 h-6 text-yellow-300" />
                <span className="text-xs font-medium text-center leading-tight text-gray-200">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
