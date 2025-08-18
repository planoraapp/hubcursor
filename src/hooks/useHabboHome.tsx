
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from './useSimpleAuth';

interface Widget {
  id: string;
  widget_id?: string;
  widget_type?: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: any;
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
  hotel?: string;
  motto?: string;
  figure_string?: string;
  is_online?: boolean;
}

export const useHabboHome = (username: string) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
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

  useEffect(() => {
    if (username) {
      loadHabboHome();
    }
  }, [username, habboAccount]);

  const loadHabboHome = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do usuário Habbo
      const { data: userData, error: userError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', username)
        .single();

      if (userError || !userData) {
        console.error('Usuário não encontrado:', userError);
        setHabboData(null);
        setLoading(false);
        return;
      }

      setHabboData({
        id: userData.supabase_user_id || userData.id,
        habbo_name: userData.habbo_name,
        habbo_id: userData.habbo_id,
        name: userData.habbo_name,
        hotel: userData.hotel,
        motto: userData.motto,
        figure_string: userData.figure_string,
        is_online: userData.is_online
      });

      // Verificar se o usuário atual é o dono da home
      const currentUserIsOwner = habboAccount?.habbo_name?.toLowerCase() === username.toLowerCase();
      setIsOwner(currentUserIsOwner);

      const userId = userData.supabase_user_id || userData.id;

      // Se o usuário tem supabase_user_id, inicializar sua home se necessário
      if (userData.supabase_user_id) {
        try {
          await supabase.rpc('initialize_user_home_complete', {
            user_uuid: userData.supabase_user_id,
            user_habbo_name: userData.habbo_name
          });
        } catch (initError) {
          console.error('Erro ao inicializar home:', initError);
        }
      }

      // Carregar widgets (tentar nova estrutura primeiro, depois fallback para antiga)
      let widgetsData = [];
      
      if (userData.supabase_user_id) {
        const { data: newWidgets, error: newWidgetsError } = await supabase
          .from('user_home_widgets')
          .select('*')
          .eq('user_id', userData.supabase_user_id);

        if (newWidgets && newWidgets.length > 0) {
          widgetsData = newWidgets.map(widget => ({
            id: widget.id,
            widget_id: widget.widget_type,
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
          const { data: oldLayout } = await supabase
            .from('user_home_layouts')
            .select('*')
            .eq('user_id', userData.supabase_user_id);

          if (oldLayout) {
            widgetsData = oldLayout.map(widget => ({
              id: widget.id,
              widget_id: widget.widget_id,
              widget_type: widget.widget_id,
              x: widget.x,
              y: widget.y,
              z_index: widget.z_index,
              width: widget.width || getDefaultPosition(widget.widget_id).width,
              height: widget.height || getDefaultPosition(widget.widget_id).height,
              is_visible: widget.is_visible
            }));
          }
        }
      }

      setWidgets(widgetsData);

      // Carregar stickers
      if (userData.supabase_user_id) {
        const { data: stickersData } = await supabase
          .from('user_stickers')
          .select('*')
          .eq('user_id', userData.supabase_user_id);

        setStickers(stickersData || []);
      }

      // Carregar background
      if (userData.supabase_user_id) {
        const { data: bgData } = await supabase
          .from('user_home_backgrounds')
          .select('*')
          .eq('user_id', userData.supabase_user_id)
          .single();

        if (bgData) {
          setBackground({
            background_type: bgData.background_type as 'color' | 'repeat' | 'cover',
            background_value: bgData.background_value
          });
        }
      }

      // Carregar guestbook
      if (userData.supabase_user_id) {
        const { data: guestbookData } = await supabase
          .from('guestbook_entries')
          .select('*')
          .eq('home_owner_user_id', userData.supabase_user_id)
          .order('created_at', { ascending: false })
          .limit(10);

        setGuestbook(guestbookData || []);
      }

    } catch (error) {
      console.error('Erro ao carregar Habbo Home:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    try {
      const userId = habboData.id;
      
      // Tentar atualizar na nova estrutura primeiro
      const { error: newError } = await supabase
        .from('user_home_widgets')
        .update({ x, y, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('widget_type', widgetId);

      // Se não funcionou, tentar estrutura antiga
      if (newError) {
        await supabase
          .from('user_home_layouts')
          .update({ x, y, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('widget_id', widgetId);
      }

      // Atualizar estado local
      setWidgets(prev => 
        prev.map(widget => 
          (widget.widget_id === widgetId || widget.widget_type === widgetId)
            ? { ...widget, x, y }
            : widget
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar posição do widget:', error);
    }
  };

  const updateWidgetSize = async (widgetId: string, width: number, height: number) => {
    if (!isOwner || !habboData) return;

    const restrictions = getWidgetSizeRestrictions(widgetId);
    const constrainedWidth = Math.max(restrictions.minWidth, Math.min(restrictions.maxWidth, width));
    const constrainedHeight = Math.max(restrictions.minHeight, Math.min(restrictions.maxHeight, height));

    try {
      const userId = habboData.id;
      
      // Tentar atualizar na nova estrutura primeiro
      const { error: newError } = await supabase
        .from('user_home_widgets')
        .update({ 
          width: constrainedWidth, 
          height: constrainedHeight,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('widget_type', widgetId);

      // Se não funcionou, tentar estrutura antiga
      if (newError) {
        await supabase
          .from('user_home_layouts')
          .update({ 
            width: constrainedWidth, 
            height: constrainedHeight,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('widget_id', widgetId);
      }

      // Atualizar estado local
      setWidgets(prev => 
        prev.map(widget => 
          (widget.widget_id === widgetId || widget.widget_type === widgetId)
            ? { ...widget, width: constrainedWidth, height: constrainedHeight }
            : widget
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar tamanho do widget:', error);
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

  // Posições padrão otimizadas para widgets
  const getDefaultPosition = (widgetId: string) => {
    const defaults: Record<string, { x: number; y: number; width: number; height: number }> = {
      avatar: { x: 20, y: 20, width: 520, height: 180 },
      usercard: { x: 20, y: 20, width: 520, height: 180 },
      guestbook: { x: 50, y: 220, width: 420, height: 380 },
      traxplayer: { x: 50, y: 620, width: 380, height: 220 },
      rating: { x: 500, y: 220, width: 320, height: 160 },
      info: { x: 500, y: 400, width: 320, height: 200 }
    };
    return defaults[widgetId] || { x: 50, y: 50, width: 280, height: 180 };
  };

  // Restrições de tamanho por tipo de widget
  const getWidgetSizeRestrictions = (widgetId: string) => {
    const restrictions: Record<string, { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number; resizable: boolean }> = {
      avatar: { minWidth: 520, maxWidth: 520, minHeight: 180, maxHeight: 180, resizable: false },
      usercard: { minWidth: 520, maxWidth: 520, minHeight: 180, maxHeight: 180, resizable: false },
      guestbook: { minWidth: 350, maxWidth: 600, minHeight: 300, maxHeight: 500, resizable: true },
      traxplayer: { minWidth: 300, maxWidth: 500, minHeight: 180, maxHeight: 300, resizable: true },
      rating: { minWidth: 200, maxWidth: 400, minHeight: 120, maxHeight: 200, resizable: true },
      info: { minWidth: 250, maxWidth: 450, minHeight: 150, maxHeight: 300, resizable: true }
    };
    return restrictions[widgetId] || { minWidth: 200, maxWidth: 600, minHeight: 150, maxHeight: 400, resizable: true };
  };

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
    updateWidgetSize,
    addGuestbookEntry,
    getWidgetSizeRestrictions
  };
};
