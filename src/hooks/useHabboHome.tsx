import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

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

interface PlacedSticker {
  id: string;
  sticker_id: string;
  x: number;
  y: number;
  z_index: number;
  scale?: number;
  rotation?: number;
  sticker_src: string;
  category: string;
}

export const useHabboHome = (username: string) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [background, setBackground] = useState<Background>({ 
    background_type: 'color', 
    background_value: '#c7d2dc'
  });
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [habboData, setHabboData] = useState<HabboData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const { habboAccount } = useUnifiedAuth();

  useEffect(() => {
    if (username) {
      loadHabboHome();
    }
  }, [username, habboAccount]);

  const loadHabboHome = async () => {
    try {
      setLoading(true);
      console.log('🏠 Carregando Habbo Home para:', username);
      console.log('👤 Usuário logado:', habboAccount?.habbo_name);
      
      // Buscar dados do usuário Habbo
      const { data: userData, error: userError } = await supabase
        .from('habbo_auth')
        .select('*')
        .eq('habbo_username', username)
        .single();

      if (userError || !userData) {
        console.error('❌ Usuário não encontrado:', userError);
        setHabboData(null);
        setLoading(false);
        return;
      }

      console.log('✅ Dados do usuário carregados:', userData);

      setHabboData({
        id: userData.id,
        habbo_name: userData.habbo_username,
        habbo_id: userData.id,
        name: userData.habbo_username,
        hotel: 'br', // Padrão para BR
        motto: userData.habbo_motto,
        figure_string: userData.habbo_avatar,
        is_online: false // Padrão
      });

      // Verificar se o usuário atual é o dono da home - MELHORADO
      const currentUserName = habboAccount?.habbo_name?.toLowerCase();
      const targetUserName = username.toLowerCase();
      const currentUserIsOwner = currentUserName === targetUserName;
      
      console.log('🔍 Verificação de proprietário:', {
        currentUserName,
        targetUserName,
        isOwner: currentUserIsOwner,
        habboAccountExists: !!habboAccount
      });
      
      setIsOwner(currentUserIsOwner);

      const userId = userData.supabase_user_id || userData.id;

      // Inicializar home se necessário
      if (userData.supabase_user_id) {
        try {
          console.log('🔧 Inicializando/verificando home do usuário...');
          await supabase.rpc('initialize_user_home_complete', {
            user_uuid: userData.supabase_user_id,
            user_habbo_name: userData.habbo_name
          });
          console.log('✅ Home inicializada com sucesso');
        } catch (initError) {
          console.error('❌ Erro ao inicializar home:', initError);
        }
      }

      // Carregar widgets com fallback melhorado
      let widgetsData = [];
      
      if (userData.supabase_user_id) {
        // Tentar carregar da nova estrutura primeiro
        const { data: newWidgets } = await supabase
          .from('user_home_widgets')
          .select('*')
          .eq('user_id', userData.supabase_user_id)
          .eq('is_visible', true);

        console.log('📦 Widgets carregados (nova estrutura):', newWidgets);

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
            .eq('user_id', userData.supabase_user_id)
            .eq('is_visible', true);

          console.log('📦 Widgets carregados (estrutura antiga):', oldLayout);

          if (oldLayout && oldLayout.length > 0) {
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

        // FORÇAR criação de widgets se não existirem
        if (widgetsData.length === 0) {
          console.log('⚠️ Nenhum widget encontrado, forçando criação...');
          
          const defaultWidgets = [
            { type: 'avatar', ...getDefaultPosition('avatar') },
            { type: 'guestbook', ...getDefaultPosition('guestbook') },
            { type: 'rating', ...getDefaultPosition('rating') }
          ];

          for (const widget of defaultWidgets) {
            try {
              // Inserir na nova estrutura
              const { data: newWidget } = await supabase
                .from('user_home_widgets')
                .insert({
                  user_id: userData.supabase_user_id,
                  widget_type: widget.type,
                  x: widget.x,
                  y: widget.y,
                  z_index: 1,
                  width: widget.width,
                  height: widget.height,
                  is_visible: true
                })
                .select()
                .single();

              if (newWidget) {
                widgetsData.push({
                  id: newWidget.id,
                  widget_id: newWidget.widget_type,
                  widget_type: newWidget.widget_type,
                  x: newWidget.x,
                  y: newWidget.y,
                  z_index: newWidget.z_index,
                  width: newWidget.width,
                  height: newWidget.height,
                  is_visible: newWidget.is_visible,
                  config: newWidget.config
                });
              }
              
              // Inserir na estrutura antiga também
              await supabase
                .from('user_home_layouts')
                .insert({
                  user_id: userData.supabase_user_id,
                  widget_id: widget.type,
                  x: widget.x,
                  y: widget.y,
                  z_index: 1,
                  width: widget.width,
                  height: widget.height,
                  is_visible: true
                })
                .select()
                .single();

              console.log(`✅ Widget ${widget.type} criado forçadamente`);
            } catch (error) {
              console.error(`❌ Erro ao criar widget ${widget.type}:`, error);
            }
          }
        }
      }

      console.log('📦 Widgets finais carregados:', widgetsData);
      setWidgets(widgetsData);

      // Carregar stickers com debug melhorado
      if (userData.supabase_user_id) {
        const { data: stickersData, error: stickersError } = await supabase
          .from('user_stickers')
          .select('*')
          .eq('user_id', userData.supabase_user_id);

        console.log('🎯 Stickers carregados:', { stickersData, stickersError });

        if (stickersData && !stickersError) {
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
          console.log('🎯 Stickers formatados:', formattedStickers);
          setStickers(formattedStickers);
        }
      }

      // Carregar background com debug melhorado
      if (userData.supabase_user_id) {
        const { data: bgData, error: bgError } = await supabase
          .from('user_home_backgrounds')
          .select('*')
          .eq('user_id', userData.supabase_user_id)
          .single();

        console.log('🎨 Background carregado:', { bgData, bgError });

        if (bgData && !bgError) {
          setBackground({
            background_type: bgData.background_type as 'color' | 'repeat' | 'cover',
            background_value: bgData.background_value
          });
          console.log('🎨 Background aplicado:', bgData);
        }
      }

      // Carregar guestbook
      if (userData.supabase_user_id) {
        const { data: guestbookData } = await supabase
          .from('guestbook_entries')
          .select('*')
          .eq('home_owner_user_id', userData.supabase_user_id)
          .eq('moderation_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('📝 Guestbook carregado:', guestbookData);
        setGuestbook(guestbookData || []);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar Habbo Home:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSticker = async (stickerId: string, x: number, y: number, stickerSrc: string, category: string) => {
    if (!isOwner || !habboData) {
      console.warn('⚠️ Não é possível adicionar sticker - não é proprietário ou dados não carregados');
      return;
    }

    console.log('🎯 Adicionando sticker:', { stickerId, x, y, stickerSrc, category });

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
          category: category || 'Stickers'
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
        console.log('✅ Sticker adicionado com sucesso:', newSticker);
        return newSticker;
      } else {
        console.error('❌ Erro ao adicionar sticker:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar sticker:', error);
    }
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    console.log('📦 Atualizando posição do widget:', widgetId, x, y);

    try {
      const userId = habboData.id;
      
      // Atualizar na nova estrutura
      await supabase
        .from('user_home_widgets')
        .update({ x, y, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('widget_type', widgetId);

      // Atualizar na estrutura antiga para compatibilidade
      await supabase
        .from('user_home_layouts')
        .update({ x, y, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('widget_id', widgetId);

      // Atualizar estado local
      setWidgets(prev => 
        prev.map(widget => 
          (widget.widget_id === widgetId || widget.widget_type === widgetId)
            ? { ...widget, x, y }
            : widget
        )
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar posição do widget:', error);
    }
  };

  const updateWidgetSize = async (widgetId: string, width: number, height: number) => {
    if (!isOwner || !habboData) return;

    const restrictions = getWidgetSizeRestrictions(widgetId);
    const constrainedWidth = Math.max(restrictions.minWidth, Math.min(restrictions.maxWidth, width));
    const constrainedHeight = Math.max(restrictions.minHeight, Math.min(restrictions.maxHeight, height));

    console.log('📦 Atualizando tamanho do widget:', widgetId, constrainedWidth, constrainedHeight);

    try {
      const userId = habboData.id;
      
      // Atualizar na nova estrutura
      await supabase
        .from('user_home_widgets')
        .update({ 
          width: constrainedWidth, 
          height: constrainedHeight,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('widget_type', widgetId);

      // Atualizar na estrutura antiga para compatibilidade
      await supabase
        .from('user_home_layouts')
        .update({ 
          width: constrainedWidth, 
          height: constrainedHeight,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('widget_id', widgetId);

      // Atualizar estado local
      setWidgets(prev => 
        prev.map(widget => 
          (widget.widget_id === widgetId || widget.widget_type === widgetId)
            ? { ...widget, width: constrainedWidth, height: constrainedHeight }
            : widget
        )
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar tamanho do widget:', error);
    }
  };

  const updateStickerPosition = async (stickerId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    console.log('🎯 Atualizando posição do sticker:', stickerId, x, y);

    try {
      await supabase
        .from('user_stickers')
        .update({ x, y, updated_at: new Date().toISOString() })
        .eq('id', stickerId)
        .eq('user_id', habboData.id);

      // Atualizar estado local
      setStickers(prev => 
        prev.map(sticker => 
          sticker.id === stickerId ? { ...sticker, x, y } : sticker
        )
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar posição do sticker:', error);
    }
  };

  const removeStickerFromDb = async (stickerId: string) => {
    if (!isOwner || !habboData) return;

    console.log('🎯 Removendo sticker:', stickerId);

    try {
      await supabase
        .from('user_stickers')
        .delete()
        .eq('id', stickerId)
        .eq('user_id', habboData.id);

      // Atualizar estado local
      setStickers(prev => prev.filter(sticker => sticker.id !== stickerId));
      console.log('✅ Sticker removido com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover sticker:', error);
    }
  };

  const updateBackground = async (bgType: 'color' | 'repeat' | 'cover', bgValue: string) => {
    if (!isOwner || !habboData) return;

    console.log('🎨 Atualizando background:', bgType, bgValue);

    try {
      await supabase
        .from('user_home_backgrounds')
        .upsert({
          user_id: habboData.id,
          background_type: bgType,
          background_value: bgValue,
          updated_at: new Date().toISOString()
        });

      setBackground({
        background_type: bgType,
        background_value: bgValue
      });
      console.log('✅ Background atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar background:', error);
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
      console.error('❌ Erro ao adicionar entrada no guestbook:', error);
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
    addSticker,
    updateStickerPosition,
    removeStickerFromDb,
    updateBackground,
    addGuestbookEntry,
    getWidgetSizeRestrictions
  };
};
