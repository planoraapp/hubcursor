
import React from 'react';
import { Badge } from './ui/badge';

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
  count: number;
  color: string;
}

interface BadgeCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: CategoryOption[];
}

export const BadgeCategoryTabs: React.FC<BadgeCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  categories
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
            activeCategory === category.value
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200'
          }`}
        >
          <span className="text-lg">{category.icon}</span>
          <span className="font-semibold">{category.label}</span>
          <Badge 
            variant={activeCategory === category.value ? "secondary" : "outline"}
            className={
              activeCategory === category.value 
                ? "bg-white/20 text-white border-white/30" 
                : category.color
            }
          >
            {category.count.toLocaleString()}
          </Badge>
        </button>
      ))}
    </div>
  );
};
