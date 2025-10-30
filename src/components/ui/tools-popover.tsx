
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
    { id: 'catalogo', label: t('catalogo'), icon: '/assets/Tools/Carrinho.png', path: '/catalogo' },
    { id: 'emblemas', label: t('emblemas'), icon: '/assets/Tools/emblemas.png', path: '/emblemas' },
    { id: 'editor', label: t('editor'), icon: '/assets/Tools/editorvisuais.png', path: '/editor' },
    { id: 'mercado', label: t('mercado'), icon: '/assets/Tools/Diamante.png', path: '/mercado' },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-72">
      <div 
        className="p-4 rounded-xl shadow-2xl border-4"
        style={{
          backgroundColor: '#f5f5dc',
          borderColor: '#000',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)',
          background: 'linear-gradient(135deg, #f5f5dc 0%, #f0f0dc 50%, #f5f5dc 100%)'
        }}
      >
        {/* Header */}
        <div className="text-center pb-3 border-b border-black/30">
          <span 
            className="font-bold text-lg text-black volter-font"
            style={{ 
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)'
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
                    ? 'rgba(0, 0, 0, 0.2)' 
                    : 'rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${isActive ? '#000' : '#666'}`,
                  boxShadow: isActive 
                    ? '0 0 10px rgba(0, 0, 0, 0.5)' 
                    : '0 2px 5px rgba(0, 0, 0, 0.2)'
                }}
                onClick={() => handleItemClick(item.path)}
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6 object-contain" />
                <span className="text-xs font-medium text-center leading-tight text-black">
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
