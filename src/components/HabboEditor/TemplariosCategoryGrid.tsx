
import React, { useState } from 'react';
import { useTemplariosData } from '@/hooks/useTemplariosData';
import { useTemplariosPreview } from '@/hooks/useTemplariosPreview';
import { Gender } from '@/hooks/useTemplariosFigure';
import TemplariosColorModal from './TemplariosColorModal';
import { CATEGORY_NAMES } from '@/data/habboTemplariosData';

interface TemplariosCategoryGridProps {
  activeType: string;
  gender: Gender;
  selection: { [type: string]: { setId: string; colorId?: string } | undefined };
  onSelectItem: (type: string, setId: string) => void;
  onChangeColor: (type: string, colorId: string) => void;
}

const TemplariosCategoryGrid: React.FC<TemplariosCategoryGridProps> = ({
  activeType,
  gender,
  selection,
  onSelectItem,
  onChangeColor
}) => {
  const { getItemsByCategory, getPaletteForCategory } = useTemplariosData();
  const { getSinglePartPreviewUrl } = useTemplariosPreview();
  const [colorModalOpen, setColorModalOpen] = useState(false);

  const filteredItems = getItemsByCategory(activeType, gender);
  const palette = getPaletteForCategory(activeType);
  const currentSelection = selection[activeType];

  const handleItemClick = (setId: string) => {
    onSelectItem(activeType, setId);
    
    // If item has colors available, show color modal
    if (palette && Object.keys(palette).length > 0) {
      setColorModalOpen(true);
    }
  };

  const handleColorSelect = (colorId: string) => {
    onChangeColor(activeType, colorId);
    setColorModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredItems.map(item => {
          const isSelected = currentSelection?.setId === item.id;
          const colorId = currentSelection?.colorId ?? '0';
          const thumbnailUrl = getSinglePartPreviewUrl(activeType, item.id, colorId, gender);
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`rounded-lg border bg-white/60 p-2 hover:bg-white/80 transition-all ${
                isSelected ? 'ring-2 ring-purple-400 bg-white/80' : ''
              }`}
            >
              <div className="w-full aspect-square grid place-items-center">
                <img 
                  src={thumbnailUrl} 
                  alt={`${activeType}-${item.id}`} 
                  className="max-h-full object-contain" 
                  loading="lazy" 
                />
              </div>
              <div className="mt-2 text-xs text-center opacity-80">
                #{item.id}
                {item.club === 2 && <span className="text-yellow-600"> (HC)</span>}
              </div>
            </button>
          );
        })}
        
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center text-sm opacity-70 py-8">
            Nenhum item disponível para este gênero nesta categoria.
          </div>
        )}
      </div>

      {palette && (
        <TemplariosColorModal
          isOpen={colorModalOpen}
          onClose={() => setColorModalOpen(false)}
          palette={palette}
          selectedColor={currentSelection?.colorId ?? '0'}
          onColorSelect={handleColorSelect}
          categoryName={CATEGORY_NAMES[activeType] || activeType.toUpperCase()}
        />
      )}
    </div>
  );
};

export default TemplariosCategoryGrid;
