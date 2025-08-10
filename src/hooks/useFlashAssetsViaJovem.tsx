
import { useState } from 'react';

export interface ViaJovemFlashItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F';
  imageUrl: string;
}

export const useFlashAssetsViaJovem = () => {
  const [items] = useState<ViaJovemFlashItem[]>([]);
  const [categoryStats] = useState<Record<string, number>>({});

  return {
    items,
    categoryStats,
    isLoading: false,
    error: null,
    totalItems: items.length,
  };
};

export const useFlashViaJovemCategory = (categoryId: string, gender: 'M' | 'F') => {
  const [items] = useState<ViaJovemFlashItem[]>([]);

  return {
    items,
    isLoading: false,
    error: null,
  };
};
