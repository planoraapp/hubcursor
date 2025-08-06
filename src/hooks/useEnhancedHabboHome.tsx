
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserByName } from '../lib/habboApi';

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
  const { toast } = useToast();

  useEffect(() => {
    if (username) {
      loadHabboHome();
    }
  }, [username, habboAccount]);

  const loadHabboHome = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Carregando Habbo Home para usuário:', username);
      
      // Primeiro, buscar dados da API oficial do Habbo
      const habboApiData = await getUserByName(username);
      console.log('📊 Dados da API do Habbo:', habboApiData);
      
      // Buscar dados do usuário no banco local
      const { data: userData, error: userError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', username)
        .single();

      if (userError || !userData) {
        console.error('❌ Usuário não encontrado no banco:', userError);
        setError('Usuário não encontrado');
        setHabboData(null);
        setLoading(false);
        return;
      }

      console.log('✅ Dados do usuário encontrados:', userData);

      // Combinar dados da API com dados locais
      const combinedHabboData: HabboData = {
        id: userData.id,
        habbo_name: userData.habbo_name,
        habbo_id: userData.habbo_id,
        name: userData.habbo_name,
        figureString: habboApiData?.figureString || '',
        motto: habboApiData?.motto || '',
        online: habboApiData?.online || false,
        memberSince: habboApiData?.memberSince || '',
        selectedBadges: habboApiData?.selectedBadges || []
      };

      setHabboData(combinedHabboData);

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
          title: getWidgetTitle(widget.widget_id),
          content: getWidgetContent(widget.widget_id, combinedHabboData)
        }));
        setWidgets(widgetsWithContent);
      }

      // Carregar stickers
      const { data: stickerData, error: stickerError } = await supabase
        .from('user_stickers')
        .select('*')
        .eq('user_id', userData.supabase_user_id);

      if (!stickerError && stickerData) {
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
      console.error('💥 Erro ao carregar Habbo Home:', error);
      setError('Erro ao carregar Habbo Home');
    } finally {
      setLoading(false);
    }
  };

  const getWidgetTitle = (widgetId: string): string => {
    const titles: Record<string, string> = {
      'avatar': 'Avatar',
      'guestbook': 'Livro de Visitas',
      'rating': 'Avaliação',
      'info': 'Informações',
      'traxplayer': 'Player de Música'
    };
    return titles[widgetId] || 'Widget';
  };

  const getWidgetContent = (widgetId: string, habboData: HabboData): string => {
    switch (widgetId) {
      case 'avatar':
        return `Olá! Sou ${habboData.name}`;
      case 'guestbook':
        return 'Deixe uma mensagem!';
      case 'rating':
        return 'Avalie esta home!';
      case 'info':
        return habboData.motto || 'Sem missão definida';
      default:
        return 'Conteúdo do widget';
    }
  };

  const addWidget = async (widgetType: string) => {
    if (!isOwner || !habboData) return;
    
    try {
      const newWidget = {
        user_id: habboData.id,
        widget_id: widgetType,
        x: 50,
        y: 50,
        z_index: Math.max(...widgets.map(w => w.z_index), 0) + 1,
        width: 300,
        height: 200,
        is_visible: true
      };

      const { data, error } = await supabase
        .from('user_home_layouts')
        .insert(newWidget)
        .select()
        .single();

      if (!error && data) {
        const widgetWithContent = {
          ...data,
          name: data.widget_id,
          title: getWidgetTitle(data.widget_id),
          content: getWidgetContent(data.widget_id, habboData)
        };
        setWidgets(prev => [...prev, widgetWithContent]);
      }
    } catch (error) {
      console.error('Erro ao adicionar widget:', error);
    }
  };

  const removeWidget = async (widgetId: string) => {
    if (!isOwner) return;
    
    try {
      const { error } = await supabase
        .from('user_home_layouts')
        .delete()
        .eq('id', widgetId);

      if (!error) {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
      }
    } catch (error) {
      console.error('Erro ao remover widget:', error);
    }
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner) return;
    
    try {
      const { error } = await supabase
        .from('user_home_layouts')
        .update({ x, y })
        .eq('id', widgetId);

      if (!error) {
        setWidgets(prev => 
          prev.map(widget => 
            widget.id === widgetId 
              ? { ...widget, x, y }
              : widget
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar posição do widget:', error);
    }
  };

  const handleSaveLayout = async () => {
    if (!isOwner) return;
    
    toast({
      title: "Layout Salvo",
      description: "Suas alterações foram salvas com sucesso!",
    });
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
    homeData: habboData,
    
    // State properties  
    loading,
    isLoading: loading,
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
    
    // Guestbook functions
    addGuestbookEntry
  };
};
