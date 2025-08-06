
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from './useSimpleAuth';

interface Widget {
  id: string;
  widget_id: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
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
}

export const useHabboHome = (username: string) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [background, setBackground] = useState<Background>({ 
    background_type: 'color', 
    background_value: '#f5f5f5' // Cinza claro padrão correto
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
        id: userData.id,
        habbo_name: userData.habbo_name,
        habbo_id: userData.habbo_id,
        name: userData.habbo_name
      });

      // Verificar se o usuário atual é o dono da home
      const currentUserIsOwner = habboAccount?.habbo_name?.toLowerCase() === username.toLowerCase();
      setIsOwner(currentUserIsOwner);

      // Carregar layout dos widgets
      const { data: layoutData, error: layoutError } = await supabase
        .from('user_home_layouts')
        .select('*')
        .eq('user_id', userData.supabase_user_id);

      if (!layoutError && layoutData) {
        setWidgets(layoutData);
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

      // Carregar guestbook usando a tabela correta
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
    } finally {
      setLoading(false);
    }
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    try {
      const { error } = await supabase
        .from('user_home_layouts')
        .upsert({
          user_id: habboData.id,
          widget_id: widgetId,
          x,
          y,
          z_index: 1,
          width: getDefaultPosition(widgetId).width,
          height: getDefaultPosition(widgetId).height,
          is_visible: true
        });

      if (!error) {
        setWidgets(prev => 
          prev.map(widget => 
            widget.widget_id === widgetId 
              ? { ...widget, x, y }
              : widget
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar posição do widget:', error);
    }
  };

  const updateWidgetSize = async (widgetId: string, width: number, height: number) => {
    if (!isOwner || !habboData) return;

    try {
      const { error } = await supabase
        .from('user_home_layouts')
        .update({ width, height })
        .eq('user_id', habboData.id)
        .eq('widget_id', widgetId);

      if (!error) {
        setWidgets(prev => 
          prev.map(widget => 
            widget.widget_id === widgetId 
              ? { ...widget, width, height }
              : widget
          )
        );
      }
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
      usercard: { x: 20, y: 20, width: 520, height: 180 },
      guestbook: { x: 50, y: 220, width: 420, height: 380 },
      traxplayer: { x: 50, y: 620, width: 380, height: 220 },
      rating: { x: 500, y: 220, width: 320, height: 160 },
      info: { x: 500, y: 400, width: 320, height: 200 }
    };
    return defaults[widgetId] || { x: 50, y: 50, width: 280, height: 180 };
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
    addGuestbookEntry
  };
};
