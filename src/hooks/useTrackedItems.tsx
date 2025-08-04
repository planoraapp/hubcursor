
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  // Função para buscar itens salvos
  const fetchTrackedItems = async () => {
    if (!user) {
      setTrackedItems([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_tracked_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar itens salvos:', error);
        return;
      }

      setTrackedItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens salvos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar item
  const trackItem = async (item: { classname: string; name: string; hotel_id: string }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_tracked_items')
        .insert({
          user_id: user.id,
          item_classname: item.classname,
          item_name: item.name,
          hotel_id: item.hotel_id
        });

      if (error) {
        console.error('Erro ao salvar item:', error);
        return false;
      }

      // Atualizar lista local
      await fetchTrackedItems();
      return true;
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      return false;
    }
  };

  // Função para remover item
  const untrackItem = async (classname: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_tracked_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_classname', classname)
        .eq('hotel_id', hotelId);

      if (error) {
        console.error('Erro ao remover item:', error);
        return false;
      }

      // Atualizar lista local
      await fetchTrackedItems();
      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return false;
    }
  };

  // Verificar se item está salvo
  const isTracked = (classname: string): boolean => {
    return trackedItems.some(item => item.classname === classname);
  };

  // Buscar itens quando usuário ou hotel mudar
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
