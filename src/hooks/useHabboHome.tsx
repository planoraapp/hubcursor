
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getUserByName } from '@/services/habboApi';

interface HabboHomeWidget {
  id: string;
  widget_id: string;
  x: number;
  y: number;
  z_index: number;
  width?: number;
  height?: number;
  is_visible: boolean;
}

interface HabboHomeSticker {
  id: string;
  sticker_id: string;
  sticker_src: string;
  x: number;
  y: number;
  z_index: number;
}

interface HabboHomeBackground {
  background_type: 'color' | 'repeat' | 'cover';
  background_value: string;
}

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface HabboUserData {
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  memberSince: string;
  selectedBadges: Array<{
    badgeIndex: number;
    code: string;
    name: string;
    description: string;
  }>;
}

export const useHabboHome = (username: string) => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<HabboHomeWidget[]>([]);
  const [stickers, setStickers] = useState<HabboHomeSticker[]>([]);
  const [background, setBackground] = useState<HabboHomeBackground>({
    background_type: 'color',
    background_value: '#007bff'
  });
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [habboData, setHabboData] = useState<HabboUserData | null>(null);
  const [homeOwnerUserId, setHomeOwnerUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Buscar dados do usuário Habbo
  useEffect(() => {
    if (username) {
      getUserByName(username).then(data => {
        setHabboData(data);
      }).catch(console.error);

      // Buscar user_id do proprietário da home
      supabase
        .from('habbo_accounts')
        .select('supabase_user_id')
        .eq('habbo_name', username)
        .single()
        .then(({ data }) => {
          if (data) {
            setHomeOwnerUserId(data.supabase_user_id);
          }
        });
    }
  }, [username]);

  // Carregar dados da home
  useEffect(() => {
    if (homeOwnerUserId) {
      loadHomeData();
    }
  }, [homeOwnerUserId]);

  const loadHomeData = async () => {
    if (!homeOwnerUserId) return;

    try {
      setLoading(true);

      // Carregar widgets
      const { data: widgetsData } = await supabase
        .from('user_home_layouts')
        .select('*')
        .eq('user_id', homeOwnerUserId);

      if (widgetsData) {
        setWidgets(widgetsData);
      }

      // Carregar stickers
      const { data: stickersData } = await supabase
        .from('user_stickers')
        .select('*')
        .eq('user_id', homeOwnerUserId);

      if (stickersData) {
        setStickers(stickersData);
      }

      // Carregar background
      const { data: backgroundData } = await supabase
        .from('user_home_backgrounds')
        .select('*')
        .eq('user_id', homeOwnerUserId)
        .single();

      if (backgroundData) {
        setBackground({
          background_type: backgroundData.background_type as 'color' | 'repeat' | 'cover',
          background_value: backgroundData.background_value
        });
      }

      // Carregar guestbook
      const { data: guestbookData } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('home_owner_user_id', homeOwnerUserId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (guestbookData) {
        setGuestbook(guestbookData);
      }

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number, zIndex?: number) => {
    if (!homeOwnerUserId || !user || user.id !== homeOwnerUserId) return;

    const updateData: any = { x, y };
    if (zIndex !== undefined) {
      updateData.z_index = zIndex;
    }

    const { error } = await supabase
      .from('user_home_layouts')
      .upsert({
        user_id: homeOwnerUserId,
        widget_id: widgetId,
        ...updateData
      });

    if (!error) {
      setWidgets(prev => prev.map(w => 
        w.widget_id === widgetId ? { ...w, ...updateData } : w
      ));
    }
  };

  const updateWidgetSize = async (widgetId: string, width: number, height: number) => {
    if (!homeOwnerUserId || !user || user.id !== homeOwnerUserId) return;

    const { error } = await supabase
      .from('user_home_layouts')
      .upsert({
        user_id: homeOwnerUserId,
        widget_id: widgetId,
        width,
        height
      });

    if (!error) {
      setWidgets(prev => prev.map(w => 
        w.widget_id === widgetId ? { ...w, width, height } : w
      ));
    }
  };

  const addSticker = async (stickerId: string, stickerSrc: string, x: number, y: number) => {
    if (!homeOwnerUserId || !user || user.id !== homeOwnerUserId) return;

    const { error } = await supabase
      .from('user_stickers')
      .insert({
        user_id: homeOwnerUserId,
        sticker_id: stickerId,
        sticker_src: stickerSrc,
        x,
        y,
        z_index: Math.max(...stickers.map(s => s.z_index), 0) + 1
      });

    if (!error) {
      loadHomeData();
    }
  };

  const updateBackground = async (type: 'color' | 'repeat' | 'cover', value: string) => {
    if (!homeOwnerUserId || !user || user.id !== homeOwnerUserId) return;

    const { error } = await supabase
      .from('user_home_backgrounds')
      .upsert({
        user_id: homeOwnerUserId,
        background_type: type,
        background_value: value
      });

    if (!error) {
      setBackground({ background_type: type, background_value: value });
    }
  };

  const addGuestbookEntry = async (message: string) => {
    if (!homeOwnerUserId || !user) return;

    const { error } = await supabase
      .from('guestbook_entries')
      .insert({
        home_owner_user_id: homeOwnerUserId,
        author_user_id: user.id,
        author_habbo_name: user.user_metadata?.habbo_name || 'Anônimo',
        message
      });

    if (!error) {
      loadHomeData();
    }
  };

  const isOwner = user && homeOwnerUserId && user.id === homeOwnerUserId;

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
    addSticker,
    updateBackground,
    addGuestbookEntry,
    refreshData: loadHomeData
  };
};
