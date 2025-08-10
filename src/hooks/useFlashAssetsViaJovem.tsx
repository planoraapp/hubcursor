import { useState, useEffect } from 'react';

export interface ViaJovemFlashItem {
  id: string;
  name: string;
  type: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  thumbnail?: string;
  thumbnailUrl: string;
  colors: string[]; // Made required to match OfficialHabboAsset
  club: 'FREE' | 'HC'; // Made required to match OfficialHabboAsset
  swfName?: string;
  source?: string;
}

export const useFlashAssetsViaJovem = () => {
  const [items, setItems] = useState<ViaJovemFlashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async (type: string, gender: 'M' | 'F' | 'U' = 'U') => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for development
      const mockItems: ViaJovemFlashItem[] = [
        {
          id: '1',
          name: 'Test Item 1',
          type: type,
          category: type,
          gender: gender,
          figureId: 'test-1',
          thumbnail: 'https://via.placeholder.com/64',
          thumbnailUrl: 'https://via.placeholder.com/64',
          colors: ['1', '2', '3'], // Now required
          club: 'FREE',
          swfName: 'test-1.swf',
          source: 'viajovem'
        },
        {
          id: '2',
          name: 'Test Item 2',
          type: type,
          category: type,
          gender: gender,
          figureId: 'test-2',
          thumbnail: 'https://via.placeholder.com/64',
          thumbnailUrl: 'https://via.placeholder.com/64',
          colors: ['1', '2', '3'], // Now required
          club: 'HC',
          swfName: 'test-2.swf',
          source: 'viajovem'
        }
      ];
      
      setItems(mockItems);
      
      // Calculate category stats
      const stats = mockItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setCategoryStats(stats);
      
    } catch (error) {
      console.error('Error fetching ViaJovem items:', error);
      setError('Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    isLoading: loading,
    error,
    categoryStats,
    totalItems: items.length,
    fetchItems
  };
};

export const useFlashViaJovemCategory = (categoryId: string, gender: 'M' | 'F') => {
  const [items, setItems] = useState<ViaJovemFlashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock category-specific items
        const mockCategoryItems: ViaJovemFlashItem[] = [
          {
            id: `${categoryId}_1`,
            name: `${categoryId} Item 1`,
            type: categoryId,
            category: categoryId,
            gender: gender,
            figureId: `${categoryId}-1`,
            thumbnail: 'https://via.placeholder.com/64',
            thumbnailUrl: 'https://via.placeholder.com/64',
            colors: ['1', '2', '3'], // Now required
            club: 'FREE',
            swfName: `${categoryId}-1.swf`,
            source: 'viajovem'
          },
          {
            id: `${categoryId}_2`,
            name: `${categoryId} Item 2`,
            type: categoryId,
            category: categoryId,
            gender: gender,
            figureId: `${categoryId}-2`,
            thumbnail: 'https://via.placeholder.com/64',
            thumbnailUrl: 'https://via.placeholder.com/64',
            colors: ['1', '2', '3'], // Now required
            club: 'HC',
            swfName: `${categoryId}-2.swf`,
            source: 'viajovem'
          }
        ];
        
        setItems(mockCategoryItems);
      } catch (error) {
        console.error('Error fetching category items:', error);
        setError('Failed to fetch category items');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryItems();
  }, [categoryId, gender]);

  return {
    items,
    loading,
    isLoading: loading,
    error
  };
};
