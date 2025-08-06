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
    background_value: '#f5f5f5'
  });
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [habboData, setHabboData] = useState<HabboUserData | null>(null);
  const [homeOwnerUserId, setHomeOwnerUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Buscar dados do usuário Habbo
  useEffect(() => {
    if (username) {
      console.log('🔍 [HabboHome] Iniciando busca para username:', username);
      
      getUserByName(username).then(data => {
        console.log('✅ [HabboHome] Dados do Habbo API recebidos:', data);
        setHabboData(data);
      }).catch(error => {
        console.error('❌ [HabboHome] Erro ao buscar dados do Habbo:', error);
        setHabboData(null);
      });

      // Buscar user_id do proprietário da home
      console.log('🔍 [HabboHome] Buscando conta vinculada para:', username);
      supabase
        .from('habbo_accounts')
        .select('supabase_user_id')
        .ilike('habbo_name', username) // Case insensitive search
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error('❌ [HabboHome] Erro ao buscar conta vinculada:', error);
            setHomeOwnerUserId(null);
            return;
          }

          if (data) {
            console.log('✅ [HabboHome] Conta vinculada encontrada:', data);
            setHomeOwnerUserId(data.supabase_user_id);
          } else {
            console.log('⚠️ [HabboHome] Nenhuma conta vinculada encontrada para:', username);
            setHomeOwnerUserId(null);
          }
        });
    }
  }, [username]);

  // Carregar dados da home
  useEffect(() => {
    if (homeOwnerUserId) {
      console.log('🏠 [HabboHome] Carregando dados da home para user_id:', homeOwnerUserId);
      loadHomeData();
    } else if (homeOwnerUserId === null && habboData) {
      // Se não encontramos conta vinculada mas temos dados do Habbo, finalizar loading
      console.log('⚠️ [HabboHome] Home sem conta vinculada, finalizando loading');
      setLoading(false);
    }
  }, [homeOwnerUserId, habboData]);

  const loadHomeData = async () => {
    if (!homeOwnerUserId) {
      console.log('❌ [HabboHome] loadHomeData chamado sem homeOwnerUserId');
      return;
    }

    try {
      console.log('🔄 [HabboHome] Iniciando carregamento dos dados da home...');
      setLoading(true);

      // Carregar widgets
      console.log('📦 [HabboHome] Carregando widgets...');
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('user_home_layouts')
        .select('*')
        .eq('user_id', homeOwnerUserId);

      if (widgetsError) {
        console.error('❌ [HabboHome] Erro ao carregar widgets:', widgetsError);
      } else {
        console.log('✅ [HabboHome] Widgets carregados:', widgetsData?.length || 0, 'itens');
        setWidgets(widgetsData || []);
      }

      // Carregar stickers
      console.log('🎨 [HabboHome] Carregando stickers...');
      const { data: stickersData, error: stickersError } = await supabase
        .from('user_stickers')
        .select('*')
        .eq('user_id', homeOwnerUserId);

      if (stickersError) {
        console.error('❌ [HabboHome] Erro ao carregar stickers:', stickersError);
      } else {
        console.log('✅ [HabboHome] Stickers carregados:', stickersData?.length || 0, 'itens');
        setStickers(stickersData || []);
      }

      // Carregar background
      console.log('🎨 [HabboHome] Carregando background...');
      const { data: backgroundData, error: backgroundError } = await supabase
        .from('user_home_backgrounds')
        .select('*')
        .eq('user_id', homeOwnerUserId)
        .maybeSingle();

      if (backgroundError) {
        console.error('❌ [HabboHome] Erro ao carregar background:', backgroundError);
      } else if (backgroundData) {
        console.log('✅ [HabboHome] Background carregado:', backgroundData);
        setBackground({
          background_type: backgroundData.background_type as 'color' | 'repeat' | 'cover',
          background_value: backgroundData.background_value
        });
      } else {
        console.log('⚠️ [HabboHome] Nenhum background encontrado, usando padrão');
      }

      // Carregar guestbook
      console.log('📝 [HabboHome] Carregando guestbook...');
      const { data: guestbookData, error: guestbookError } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('home_owner_user_id', homeOwnerUserId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (guestbookError) {
        console.error('❌ [HabboHome] Erro ao carregar guestbook:', guestbookError);
      } else {
        console.log('✅ [HabboHome] Guestbook carregado:', guestbookData?.length || 0, 'entradas');
        setGuestbook(guestbookData || []);
      }

      console.log('✅ [HabboHome] Carregamento completo!');

    } catch (error) {
      console.error('❌ [HabboHome] Erro geral no carregamento:', error);
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
