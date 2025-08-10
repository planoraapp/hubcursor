
import { useState, useEffect } from 'react';

export interface ViaJovemFlashItem {
  id: string;
  name: string;
  type: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  thumbnail?: string;
  colors?: string[];
  club?: boolean;
}

export const useFlashAssetsViaJovem = () => {
  const [items, setItems] = useState<ViaJovemFlashItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async (type: string, gender: 'M' | 'F' | 'U' = 'U') => {
    setLoading(true);
    try {
      // Mock data for development
      const mockItems: ViaJovemFlashItem[] = [
        {
          id: '1',
          name: 'Test Item 1',
          type: type,
          gender: gender,
          figureId: 'test-1',
          thumbnail: 'https://via.placeholder.com/64',
          colors: ['#FF0000', '#00FF00'],
          club: false
        },
        {
          id: '2',
          name: 'Test Item 2',
          type: type,
          gender: gender,
          figureId: 'test-2',
          thumbnail: 'https://via.placeholder.com/64',
          colors: ['#0000FF', '#FFFF00'],
          club: true
        }
      ];
      
      setItems(mockItems);
    } catch (error) {
      console.error('Error fetching ViaJovem items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    fetchItems
  };
};
