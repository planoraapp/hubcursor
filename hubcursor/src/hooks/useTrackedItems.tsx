
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface TrackedItem {
  classname: string;
  name: string;
  hotel_id: string;
  currentPrice?: number;
  priceChange?: number;
  lastUpdated?: string;
}

export const useTrackedItems = (hotelId: string) => {
  const { user } = useAuth();
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(false);

  // For now, use localStorage until the database table is created
  const storageKey = `tracked_items_${user?.id}_${hotelId}`;

  const fetchTrackedItems = async () => {
    if (!user) {
      setTrackedItems([]);
      return;
    }

    try {
      setLoading(true);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTrackedItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao buscar itens salvos:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackItem = async (item: { classname: string; name: string; hotel_id: string }) => {
    if (!user) return false;

    try {
      const currentItems = [...trackedItems];
      const newItem: TrackedItem = {
        classname: item.classname,
        name: item.name,
        hotel_id: item.hotel_id,
        lastUpdated: new Date().toISOString()
      };
      
      if (!currentItems.find(i => i.classname === item.classname)) {
        currentItems.push(newItem);
        localStorage.setItem(storageKey, JSON.stringify(currentItems));
        setTrackedItems(currentItems);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      return false;
    }
  };

  const untrackItem = async (classname: string) => {
    if (!user) return false;

    try {
      const currentItems = trackedItems.filter(item => item.classname !== classname);
      localStorage.setItem(storageKey, JSON.stringify(currentItems));
      setTrackedItems(currentItems);
      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return false;
    }
  };

  const isTracked = (classname: string): boolean => {
    return trackedItems.some(item => item.classname === classname);
  };

  useEffect(() => {
    fetchTrackedItems();
  }, [user, hotelId]);

  return {
    trackedItems,
    loading,
    trackItem,
    untrackItem,
    isTracked,
    refresh: fetchTrackedItems
  };
};
