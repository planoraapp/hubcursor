
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from './useSimpleAuth';

interface Widget {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: any;
}

interface Sticker {
  id: string;
  sticker_id: string;
  x: number;
  y: number;
  z_index: number;
  scale: number;
  rotation: number;
  sticker_src: string;
  category: string;
}

interface Background {
  background_type: 'color' | 'cover' | 'repeat';
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
  hotel: string;
  motto: string;
  figure_string: string;
  is_online: boolean;
}

export const useHabboHomeV2 = (username: string) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [background, setBackground] = useState<Background>({ 
    background_type: 'color', 
    background_value: '#c7d2dc'
  });
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [habboData, setHabboData] = useState<HabboData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const { habboAccount } = useSimpleAuth();

  const loadHabboHomeData = async () => {
    try {
      setLoading(true);
      console.log('🏠 Carregando dados da Habbo Home para:', username);

      // 1. Carregar dados do usuário Habbo
      const { data: userData, error: userError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', username)
        .single();

      if (userError || !userData) {
        console.error('❌ Usuário não encontrado:', userError);
        setHabboData(null);
        return;
      }

      console.log('✅ Dados do usuário carregados:', userData);

      const habboInfo: HabboData = {
        id: userData.supabase_user_id,
        habbo_name: userData.habbo_name,
        habbo_id: userData.habbo_id,
        hotel: userData.hotel || 'br',
        motto: userData.motto || '',
        figure_string: userData.figure_string || '',
        is_online: userData.is_online || false
      };

      setHabboData(habboInfo);

      // 2. Verificar proprietário
      const currentUserIsOwner = habboAccount?.habbo_name?.toLowerCase() === username.toLowerCase();
      setIsOwner(currentUserIsOwner);
      console.log('🔍 Verificação de proprietário:', { currentUserIsOwner, currentUser: habboAccount?.habbo_name, targetUser: username });

      const userId = userData.supabase_user_id;

      // 3. Carregar widgets (tentar estrutura nova primeiro, depois antiga)
      let widgetsData: Widget[] = [];

      const { data: newWidgets } = await supabase
        .from('user_home_widgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_visible', true);

      if (newWidgets && newWidgets.length > 0) {
        widgetsData = newWidgets.map(widget => ({
          id: widget.id,
          widget_type: widget.widget_type,
          x: widget.x,
          y: widget.y,
          z_index: widget.z_index,
          width: widget.width,
          height: widget.height,
          is_visible: widget.is_visible,
          config: widget.config
        }));
      } else {
        // Fallback para estrutura antiga
        const { data: oldWidgets } = await supabase
          .from('user_home_layouts')
          .select('*')
          .eq('user_id', userId)
          .eq('is_visible', true);

        if (oldWidgets && oldWidgets.length > 0) {
          widgetsData = oldWidgets.map(widget => ({
            id: widget.id,
            widget_type: widget.widget_id,
            x: widget.x,
            y: widget.y,
            z_index: widget.z_index,
            width: widget.width || 300,
            height: widget.height || 200,
            is_visible: widget.is_visible,
            config: {}
          }));
        }
      }

      console.log('📦 Widgets carregados:', widgetsData);
      setWidgets(widgetsData);

      // 4. Carregar stickers
      const { data: stickersData } = await supabase
        .from('user_stickers')
        .select('*')
        .eq('user_id', userId);

      if (stickersData) {
        const formattedStickers = stickersData.map(sticker => ({
          id: sticker.id,
          sticker_id: sticker.sticker_id,
          x: sticker.x,
          y: sticker.y,
          z_index: sticker.z_index,
          scale: Number(sticker.scale) || 1,
          rotation: sticker.rotation || 0,
          sticker_src: sticker.sticker_src,
          category: sticker.category || 'Stickers'
        }));
        console.log('🎯 Stickers carregados:', formattedStickers);
        setStickers(formattedStickers);
      }

      // 5. Carregar background
      const { data: bgData } = await supabase
        .from('user_home_backgrounds')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (bgData) {
        setBackground({
          background_type: bgData.background_type as 'color' | 'cover' | 'repeat',
          background_value: bgData.background_value
        });
        console.log('🎨 Background carregado:', bgData);
      }

      // 6. Carregar guestbook
      const { data: guestbookData } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('home_owner_user_id', userId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (guestbookData) {
        setGuestbook(guestbookData);
        console.log('📝 Guestbook carregado:', guestbookData);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar Habbo Home:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções de atualização
  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    try {
      // Atualizar na estrutura nova
      await supabase
        .from('user_home_widgets')
        .update({ x, y })
        .eq('user_id', habboData.id)
        .eq('widget_type', widgetId);

      // Atualizar na estrutura antiga para compatibilidade
      await supabase
        .from('user_home_layouts')
        .update({ x, y })
        .eq('user_id', habboData.id)
        .eq('widget_id', widgetId);

      // Atualizar estado local
      setWidgets(prev => 
        prev.map(widget => 
          widget.widget_type === widgetId ? { ...widget, x, y } : widget
        )
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar posição do widget:', error);
    }
  };

  const updateStickerPosition = async (stickerId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    try {
      await supabase
        .from('user_stickers')
        .update({ x, y })
        .eq('id', stickerId)
        .eq('user_id', habboData.id);

      setStickers(prev => 
        prev.map(sticker => 
          sticker.id === stickerId ? { ...sticker, x, y } : sticker
        )
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar posição do sticker:', error);
    }
  };

  const addSticker = async (stickerId: string, x: number, y: number, stickerSrc: string, category: string) => {
    if (!isOwner || !habboData) return false;

    try {
      const { data, error } = await supabase
        .from('user_stickers')
        .insert({
          user_id: habboData.id,
          sticker_id: stickerId,
          x: Math.round(x),
          y: Math.round(y),
          z_index: Date.now(),
          scale: 1,
          rotation: 0,
          sticker_src: stickerSrc,
          category: category
        })
        .select()
        .single();

      if (!error && data) {
        const newSticker = {
          id: data.id,
          sticker_id: data.sticker_id,
          x: data.x,
          y: data.y,
          z_index: data.z_index,
          scale: Number(data.scale) || 1,
          rotation: data.rotation || 0,
          sticker_src: data.sticker_src,
          category: data.category
        };
        setStickers(prev => [...prev, newSticker]);
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar sticker:', error);
    }
    return false;
  };

  const removeSticker = async (stickerId: string) => {
    if (!isOwner || !habboData) return;

    try {
      await supabase
        .from('user_stickers')
        .delete()
        .eq('id', stickerId)
        .eq('user_id', habboData.id);

      setStickers(prev => prev.filter(sticker => sticker.id !== stickerId));
    } catch (error) {
      console.error('❌ Erro ao remover sticker:', error);
    }
  };

  const updateBackground = async (bgType: 'color' | 'cover' | 'repeat', bgValue: string) => {
    if (!isOwner || !habboData) return;

    try {
      await supabase
        .from('user_home_backgrounds')
        .upsert({
          user_id: habboData.id,
          background_type: bgType,
          background_value: bgValue
        });

      setBackground({
        background_type: bgType,
        background_value: bgValue
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar background:', error);
    }
  };

  useEffect(() => {
    if (username) {
      loadHabboHomeData();
    }
  }, [username, habboAccount]);

  return {
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    loading,
    isEditMode,
    isOwner,
    setIsEditMode,
    updateWidgetPosition,
    updateStickerPosition,
    addSticker,
    removeSticker,
    updateBackground,
    reloadData: loadHabboHomeData
  };
};
