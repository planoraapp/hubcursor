
import React, { useMemo } from 'react';
// import { useTemplariosData } from '@/hooks/useTemplariosData'; // Hook removido
import { CATEGORY_NAMES } from '@/data/habboTemplariosData';

interface TemplariosCategoryNavigationProps {
  activeType: string;
  onCategorySelect: (type: string) => void;
}

const ORDER_HINT = ['hd', 'hr', 'ch', 'lg', 'sh', 'fa', 'ha', 'he', 'ea', 'wa', 'cc', 'ca', 'cp'];

const TemplariosCategoryNavigation: React.FC<TemplariosCategoryNavigationProps> = ({
  activeType,
  onCategorySelect
}) => {
  // Hook removido - usando fallback
  const sets: any[] = [];
  
  const categories = useMemo(() => {
    const types = [...new Set(sets.map(s => s.type))];
    return types.sort((a, b) => {
      const ai = ORDER_HINT.indexOf(a);
      const bi = ORDER_HINT.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [sets]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map(type => (
        <button
          key={type}
          onClick={() => onCategorySelect(type)}
          className={`px-3 py-2 rounded border whitespace-nowrap transition-colors ${
            activeType === type 
              ? 'bg-white/70 border-purple-300' 
              : 'bg-white/30 border-gray-300 hover:bg-white/50'
          }`}
        >
          {CATEGORY_NAMES[type] || type.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default TemplariosCategoryNavigation;
