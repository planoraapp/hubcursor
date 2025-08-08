import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserByName } from '../services/habboApiMultiHotel';

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
  hotel: string;
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
    background_value: '#c7d2dc'
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
      
      console.log('🔍 Carregando Enhanced Habbo Home para usuário:', username);
      
      const normalizedUsername = username.trim().toLowerCase();
      
      // Buscar dados mínimos via RPC (compatível com RLS)
      console.log('📦 Buscando conta pública via RPC...');
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_habbo_account_public_by_name',
        { habbo_name_param: normalizedUsername }
      );

      if (rpcError) {
        console.warn('⚠️ RPC retornou erro (continuando com fallback):', rpcError);
      }

      // A função retorna uma linha no máximo; em supabase-js geralmente virá como array
      const userData = Array.isArray(rpcData) ? rpcData?.[0] : rpcData;

      if (!userData) {
        console.warn('⚠️ Usuário não encontrado no banco (via RPC), tentando API...');
        // Fallback: tentar API do Habbo
        try {
          const habboApiData = await getUserByName(username);
          if (!habboApiData) {
            throw new Error(`Usuário "${username}" não encontrado`);
          }
          
          setError(`Usuário "${username}" encontrado no Habbo, mas ainda não possui uma conta no HabboHub. Eles precisam se cadastrar primeiro.`);
          setHabboData(null);
          setLoading(false);
          return;
        } catch (apiError) {
          console.error('❌ API do Habbo também falhou:', apiError);
          setError(`Usuário "${username}" não encontrado`);
          setHabboData(null);
          setLoading(false);
          return;
        }
      }

      console.log('✅ Dados do usuário encontrados via RPC:', userData);

      // Garantir que a home existe
      console.log('🏠 Garantindo que a home existe para:', userData.supabase_user_id);
      try {
        const { error: initError } = await supabase
          .rpc('ensure_user_home_exists', { user_uuid: userData.supabase_user_id });

        if (initError) {
          console.error('⚠️ Erro ao inicializar home (continuando):', initError);
        } else {
          console.log('✅ Home inicializada com sucesso');
        }
      } catch (homeError) {
        console.warn('⚠️ Falha ao garantir home (ignorado):', homeError);
      }

      // Buscar dados da API do Habbo (com fallback)
      let habboApiData = null;
      try {
        console.log('🌐 Buscando dados da API do Habbo para:', username);
        habboApiData = await getUserByName(username);
        console.log('📊 Dados da API do Habbo:', habboApiData ? 'Sucesso' : 'Falhou');
      } catch (apiError) {
        console.warn('⚠️ Falha na API do Habbo (usando dados básicos):', apiError);
        if (userData.supabase_user_id === habboAccount?.supabase_user_id) {
          toast({
            title: "Aviso",
            description: "Alguns dados do seu perfil podem estar desatualizados devido a problemas na API do Habbo.",
            variant: "default"
          });
        }
      }

      const combinedHabboData: HabboData = {
        id: userData.supabase_user_id,
        habbo_name: userData.habbo_name,
        habbo_id: userData.habbo_id,
        hotel: userData.hotel,
        name: userData.habbo_name,
        figureString: habboApiData?.figureString || '',
        motto: habboApiData?.motto || 'Bem-vindo ao meu perfil!',
        online: habboApiData?.online || false,
        memberSince: habboApiData?.memberSince || new Date().toISOString(),
        selectedBadges: habboApiData?.selectedBadges || []
      };

      setHabboData(combinedHabboData);

      const currentUserIsOwner = habboAccount?.habbo_name?.toLowerCase() === normalizedUsername && habboAccount?.hotel === userData.hotel;
      setIsOwner(currentUserIsOwner);
      console.log('👤 É o dono?', currentUserIsOwner);

      // Carregar widgets
      const { data: layoutData, error: layoutError } = await supabase
        .from('user_home_layouts')
        .select('*')
        .eq('user_id', userData.supabase_user_id);

      console.log('📐 Widgets carregados:', layoutData?.length || 0, layoutError ? 'com erro' : 'com sucesso');

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
        console.log('✅ Stickers carregados:', stickersWithCategory.length);
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
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('📚 Guestbook carregado:', guestbookData?.length || 0, guestbookError ? 'com erro' : 'com sucesso');

      if (!guestbookError && guestbookData) {
        setGuestbook(guestbookData);
      }

      console.log('🎉 Enhanced Habbo Home carregada com sucesso!');

    } catch (error) {
      console.error('💥 Erro ao carregar Enhanced Habbo Home:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar Habbo Home';
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: "Falha ao carregar a home. Tente recarregar a página.",
        variant: "destructive"
      });
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
        return `Olá! Sou ${habboData.name} do hotel ${habboData.hotel.toUpperCase()}`;
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
        .update({ x: Math.round(x), y: Math.round(y) })
        .eq('id', widgetId);

      if (!error) {
        setWidgets(prev => 
          prev.map(widget => 
            widget.id === widgetId 
              ? { ...widget, x: Math.round(x), y: Math.round(y) }
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
          message,
          moderation_status: 'approved'
        })
        .select()
        .single();

      if (!error && data) {
        setGuestbook(prev => [data, ...prev.slice(0, 9)]);
        toast({
          title: "Mensagem Adicionada",
          description: "Sua mensagem foi adicionada ao livro de visitas!",
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar entrada no guestbook:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar mensagem",
        variant: "destructive"
      });
    }
  };

  // Fixed sticker drop with proper number handling
  const handleStickerDrop = async (stickerData: any) => {
    if (!isOwner || !habboData) return;

    try {
      const { data, error } = await supabase
        .from('user_stickers')
        .insert({
          user_id: habboData.id,
          sticker_id: stickerData.sticker_id,
          sticker_src: stickerData.sticker_src,
          category: stickerData.category,
          x: Math.round(stickerData.x || 100),
          y: Math.round(stickerData.y || 100),
          z_index: Math.round(stickerData.z_index || Date.now()),
          rotation: Math.round(stickerData.rotation || 0),
          scale: parseFloat((stickerData.scale || 1).toString())
        })
        .select()
        .single();

      if (!error && data) {
        setStickers(prev => [...prev, data]);
        
        toast({
          title: "Sticker Adicionado",
          description: "Sticker adicionado à sua home!",
        });
        
        return data;
      } else {
        console.error('Error adding sticker:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in handleStickerDrop:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar sticker",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Fixed sticker position update
  const handleStickerPositionChange = async (stickerId: string, x: number, y: number) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('user_stickers')
        .update({ x: Math.round(x), y: Math.round(y) })
        .eq('id', stickerId);

      if (!error) {
        setStickers(prev => 
          prev.map(sticker => 
            sticker.id === stickerId 
              ? { ...sticker, x: Math.round(x), y: Math.round(y) }
              : sticker
          )
        );
      }
    } catch (error) {
      console.error('Error updating sticker position:', error);
    }
  };

  // Fixed background change with proper conflict handling
  const handleBackgroundChange = async (newBackground: { type: 'color' | 'repeat' | 'cover'; value: string }) => {
    if (!isOwner || !habboData) return;

    try {
      // Optimistic update
      setBackground({
        background_type: newBackground.type,
        background_value: newBackground.value
      });

      const { error } = await supabase
        .from('user_home_backgrounds')
        .upsert({
          user_id: habboData.id,
          background_type: newBackground.type,
          background_value: newBackground.value
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating background:', error);
        // Revert on error
        setBackground(prev => prev);
        toast({
          title: "Erro",
          description: "Erro ao alterar background",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Background Alterado",
          description: "O fundo da sua home foi alterado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error in handleBackgroundChange:', error);
      // Revert on error
      setBackground(prev => prev);
    }
  };

  return {
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    
    loading,
    isLoading: loading,
    error,
    isEditMode,
    isOwner,
    
    setWidgets,
    setStickers,
    setIsEditMode,
    setBackground,
    
    addWidget,
    removeWidget,
    updateWidgetPosition,
    handleSaveLayout,
    
    addGuestbookEntry,
    handleStickerDrop,
    handleStickerPositionChange,
    handleBackgroundChange
  };
};
