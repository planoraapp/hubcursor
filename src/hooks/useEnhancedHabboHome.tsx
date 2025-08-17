
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { habboProxyService } from '@/services/habboProxyService';
import { useAuth } from './useAuth';

interface Widget {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
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

interface GuestbookEntry {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

export const useEnhancedHabboHome = (username: string, hotel?: string) => {
  const { habboAccount } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch user data
  const { data: habboData, isLoading, error } = useQuery({
    queryKey: ['habbo-home', username, hotel],
    queryFn: async () => {
      if (!username) return null;

      // First try to get from our database
      const { data: userData } = await supabase
        .rpc('get_habbo_account_public_by_name', { 
          habbo_name_param: username.toLowerCase() 
        });

      let userHotel = hotel;
      if (userData && !hotel) {
        userHotel = userData.hotel;
      }

      // Get profile from Habbo API
      const profile = await habboProxyService.getUserProfile(username, userHotel || 'com.br');
      
      if (profile) {
        return {
          ...profile,
          hotel: userHotel || userData?.hotel || 'com.br'
        };
      }

      return null;
    },
    enabled: !!username,
    retry: 2,
  });

  // Load home data
  useEffect(() => {
    if (habboData && username) {
      loadHomeData();
    }
  }, [habboData, username]);

  const loadHomeData = async () => {
    try {
      // Load widgets
      const { data: widgetData } = await supabase
        .from('home_widgets')
        .select('*')
        .eq('home_owner', username.toLowerCase())
        .order('created_at');

      if (widgetData) {
        setWidgets(widgetData.map((w: any) => ({
          id: w.id,
          title: w.title || 'Widget',
          content: w.content || 'Widget content',
          x: w.x || 0,
          y: w.y || 0,
          width: w.width,
          height: w.height,
        })));
      }

      // Load stickers
      const { data: stickerData } = await supabase
        .from('home_stickers')
        .select('*')
        .eq('home_owner', username.toLowerCase())
        .order('z_index');

      if (stickerData) {
        setStickers(stickerData);
      }

      // Load guestbook
      const { data: guestbookData } = await supabase
        .from('home_guestbook')
        .select('*')
        .eq('home_owner', username.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(20);

      if (guestbookData) {
        setGuestbook(guestbookData.map((g: any) => ({
          id: g.id,
          author: g.author,
          message: g.message,
          timestamp: g.created_at,
        })));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const isOwner = habboAccount?.habbo_name.toLowerCase() === username.toLowerCase();

  const addWidget = async (type: string) => {
    if (!isOwner) return;

    const newWidget = {
      id: `widget-${Date.now()}`,
      title: `Novo ${type}`,
      content: 'Conteúdo do widget',
      x: Math.floor(Math.random() * 3),
      y: Math.floor(Math.random() * 3),
    };

    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = async (widgetId: string) => {
    if (!isOwner) return;
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner) return;
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, x, y } : w
    ));
  };

  const handleSaveLayout = async () => {
    if (!isOwner) return;
    console.log('Saving layout...', { widgets, stickers });
  };

  const addGuestbookEntry = async (message: string) => {
    if (!habboAccount) return;

    const newEntry = {
      id: `entry-${Date.now()}`,
      author: habboAccount.habbo_name,
      message,
      timestamp: new Date().toISOString(),
    };

    setGuestbook(prev => [newEntry, ...prev]);
  };

  return {
    habboData,
    widgets,
    stickers,
    guestbook,
    loading: isLoading,
    error: error?.message,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    handleSaveLayout,
    isEditMode,
    setIsEditMode,
    isOwner,
    addGuestbookEntry,
  };
};
