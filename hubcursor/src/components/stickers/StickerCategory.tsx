
import React from 'react';
import { Button } from '@/components/ui/button';

interface StickerCategoryProps {
  category: string;
  isActive: boolean;
  onClick: () => void;
  icon?: string;
}

export const StickerCategory = ({ category, isActive, onClick, icon }: StickerCategoryProps) => {
  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      emoticons: 'Emoticons',
      decorative: 'Decorativos',
      text: 'Texto'
    };
    return labels[cat] || cat;
  };

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`px-3 py-2 text-sm volter-font ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {getCategoryLabel(category)}
    </Button>
  );
};
