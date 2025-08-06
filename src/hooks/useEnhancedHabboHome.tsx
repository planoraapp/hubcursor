import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface Widget {
  id: string;
  widget_id: string;
  name: string;
  title: string;
  content: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
}

interface Sticker {
  id: string;
  sticker_id: string;
  sticker_src: string;
  category: string;
  x: number;
  y: number;
  z_index: number;
  rotation?: number;
  scale?: number;
}

interface Background {
  background_type: 'color' | 'repeat' | 'cover';
  background_value: string;
}

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface HabboData {
  id: string;
  habbo_name: string;
  habbo_id: string;
  name: string;
  figureString?: string;
  motto?: string;
  online?: boolean;
  memberSince?: string;
  selectedBadges?: any[];
}

export const useEnhancedHabboHome = (username: string) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [background, setBackground] = useState<Background>({ 
    background_type: 'color', 
    background_value: '#f5f5f5'
  });
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [habboData, setHabboData] = useState<HabboData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { habboAccount } = useAuth();

  useEffect(() => {
    if (username) {
      loadHabboHome();
    }
  }, [username, habboAccount]);

  const loadHabboHome = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados do usuário Habbo
      const { data: userData, error: userError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', username)
        .single();

      if (userError || !userData) {
        console.error('Usuário não encontrado:', userError);
        setError('Usuário não encontrado');
        setHabboData(null);
        setLoading(false);
        return;
      }

      setHabboData({
        id: userData.id,
        habbo_name: userData.habbo_name,
        habbo_id: userData.habbo_id,
        name: userData.habbo_name,
        figureString: '',
        motto: '',
        online: false,
        memberSince: '',
        selectedBadges: []
      });

      // Verificar se o usuário atual é o dono da home
      const currentUserIsOwner = habboAccount?.habbo_name?.toLowerCase() === username.toLowerCase();
      setIsOwner(currentUserIsOwner);

      // Carregar widgets
      const { data: layoutData, error: layoutError } = await supabase
        .from('user_home_layouts')
        .select('*')
        .eq('user_id', userData.supabase_user_id);

      if (!layoutError && layoutData) {
        const widgetsWithContent = layoutData.map(widget => ({
          ...widget,
          name: widget.widget_id || 'Widget',
          title: widget.widget_id || 'Widget',
          content: 'Conteúdo do widget'
        }));
        setWidgets(widgetsWithContent);
      }

      // Carregar stickers com categoria
      const { data: stickerData, error: stickerError } = await supabase
        .from('user_stickers')
        .select('id, sticker_id, sticker_src, category, x, y, z_index, rotation, scale')
        .eq('user_id', userData.supabase_user_id);

      if (!stickerError && stickerData) {
        // Garantir que todos os stickers tenham a propriedade category
        const stickersWithCategory = stickerData.map(sticker => ({
          id: sticker.id,
          sticker_id: sticker.sticker_id,
          sticker_src: sticker.sticker_src,
          category: sticker.category || 'decorative',
          x: sticker.x,
          y: sticker.y,
          z_index: sticker.z_index,
          rotation: sticker.rotation || 0,
          scale: sticker.scale || 1
        }));
        setStickers(stickersWithCategory);
      }

      // Carregar background
      const { data: bgData, error: bgError } = await supabase
        .from('user_home_backgrounds')
        .select('*')
        .eq('user_id', userData.supabase_user_id)
        .single();

      if (!bgError && bgData) {
        setBackground({
          background_type: bgData.background_type as 'color' | 'repeat' | 'cover',
          background_value: bgData.background_value
        });
      }

      // Carregar guestbook
      const { data: guestbookData, error: guestbookError } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('home_owner_user_id', userData.supabase_user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!guestbookError && guestbookData) {
        setGuestbook(guestbookData);
      }

    } catch (error) {
      console.error('Erro ao carregar Habbo Home:', error);
      setError('Erro ao carregar Habbo Home');
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (widgetType: string) => {
    if (!isOwner || !habboData) return;
    // Implementation for adding widgets
  };

  const removeWidget = async (widgetId: string) => {
    if (!isOwner) return;
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner) return;
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, x, y }
          : widget
      )
    );
  };

  const handleSaveLayout = async () => {
    if (!isOwner) return;
    // Implementation for saving layout
  };

  const addSticker = async (stickerData: { id: string; src: string; category: string }, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    try {
      const newSticker = {
        user_id: habboData.id,
        sticker_id: `${stickerData.id}_${Date.now()}`,
        sticker_src: stickerData.src,
        category: stickerData.category,
        x,
        y,
        z_index: Math.max(...stickers.map(s => s.z_index), 0) + 1,
        rotation: 0,
        scale: 1.0
      };

      const { data, error } = await supabase
        .from('user_stickers')
        .insert(newSticker)
        .select('id, sticker_id, sticker_src, category, x, y, z_index, rotation, scale')
        .single();

      if (!error && data) {
        const stickerWithDefaults: Sticker = {
          id: data.id,
          sticker_id: data.sticker_id,
          sticker_src: data.sticker_src,
          category: data.category || 'decorative',
          x: data.x,
          y: data.y,
          z_index: data.z_index,
          rotation: data.rotation || 0,
          scale: data.scale || 1
        };
        setStickers(prev => [...prev, stickerWithDefaults]);
        return stickerWithDefaults;
      }
    } catch (error) {
      console.error('Erro ao adicionar sticker:', error);
    }
  };

  const updateStickerPosition = async (stickerId: string, x: number, y: number) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('user_stickers')
        .update({ x, y })
        .eq('id', stickerId);

      if (!error) {
        setStickers(prev => 
          prev.map(sticker => 
            sticker.id === stickerId 
              ? { ...sticker, x, y }
              : sticker
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar posição do sticker:', error);
    }
  };

  const removeSticker = async (stickerId: string) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('user_stickers')
        .delete()
        .eq('id', stickerId);

      if (!error) {
        setStickers(prev => prev.filter(sticker => sticker.id !== stickerId));
      }
    } catch (error) {
      console.error('Erro ao remover sticker:', error);
    }
  };

  const addGuestbookEntry = async (message: string) => {
    if (!habboAccount || !habboData) return;

    try {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .insert({
          home_owner_user_id: habboData.id,
          author_user_id: habboAccount.supabase_user_id,
          author_habbo_name: habboAccount.habbo_name,
          message
        })
        .select()
        .single();

      if (!error && data) {
        setGuestbook(prev => [data, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Erro ao adicionar entrada no guestbook:', error);
    }
  };

  return {
    // Data properties
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    homeData: habboData, // Alias for backward compatibility
    
    // State properties  
    loading,
    isLoading: loading, // Alias for backward compatibility
    error,
    isEditMode,
    isOwner,
    
    // State setters
    setWidgets,
    setIsEditMode,
    
    // Widget functions
    addWidget,
    removeWidget,
    updateWidgetPosition,
    handleSaveLayout,
    
    // Sticker functions
    addSticker: async (stickerData: { id: string; src: string; category: string }, x: number, y: number) => {
      // Implementation
    },
    updateStickerPosition: async (stickerId: string, x: number, y: number) => {
      // Implementation  
    },
    removeSticker: async (stickerId: string) => {
      // Implementation
    },
    
    // Guestbook functions
    addGuestbookEntry: async (message: string) => {
      // Implementation
    }
  };
};
