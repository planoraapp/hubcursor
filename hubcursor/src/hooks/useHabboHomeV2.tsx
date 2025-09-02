import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from './useSimpleAuth';
import { habboProxyService } from '@/services/habboProxyService';
import { habboCache } from '@/services/habboCache';

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
  memberSince?: string;
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

  // Função para carregar perfil do Habbo em background
  const loadHabboProfile = async (userData: any, currentHabboInfo: HabboData) => {
    try {
      const hotel = userData.hotel === 'br' ? 'com.br' : (userData.hotel || 'com.br');
      
      // Verificar cache primeiro
      const cachedProfile = habboCache.get(userData.habbo_name, hotel);
      if (cachedProfile) {
        console.log('📦 Perfil do Habbo carregado do cache');
        setHabboData(prev => ({
          ...prev!,
          motto: cachedProfile.motto || prev!.motto,
          figure_string: cachedProfile.figureString || prev!.figure_string,
          is_online: cachedProfile.online ?? prev!.is_online,
          memberSince: cachedProfile.memberSince || prev!.memberSince
        }));
        return;
      }

      // Buscar da API se não estiver em cache
      console.log('🌐 Carregando perfil do Habbo da API...');
      const profileData = await habboProxyService.getUserProfile(userData.habbo_name, hotel);
      
      if (profileData) {
        // Salvar no cache
        habboCache.set(userData.habbo_name, hotel, profileData);
        
        // Atualizar estado com dados completos
        setHabboData(prev => ({
          ...prev!,
          motto: profileData.motto || prev!.motto,
          figure_string: profileData.figureString || prev!.figure_string,
          is_online: profileData.online ?? prev!.is_online,
          memberSince: profileData.memberSince || prev!.memberSince
        }));
        console.log('✅ Perfil do Habbo atualizado');
      }
    } catch (error) {
      console.warn('⚠️ Falha ao carregar perfil do Habbo (não crítico):', error);
    }
  };
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

      // Criar dados básicos primeiro (sem API externa)
      const basicHabboInfo: HabboData = {
        id: userData.supabase_user_id,
        habbo_name: userData.habbo_name,
        habbo_id: userData.habbo_id,
        hotel: userData.hotel || 'br',
        motto: userData.motto || '',
        figure_string: userData.figure_string || '',
        is_online: userData.is_online || false,
        memberSince: ''
      };

      setHabboData(basicHabboInfo);

      // 2. Verificar proprietário
      const currentUserIsOwner = habboAccount?.habbo_name?.toLowerCase() === username.toLowerCase();
      setIsOwner(currentUserIsOwner);
      console.log('🔍 Verificação de proprietário:', { currentUserIsOwner, currentUser: habboAccount?.habbo_name, targetUser: username });

      const userId = userData.supabase_user_id;

      // 3. Carregar dados da home em paralelo (sem bloquear com API externa)
      console.log('🚀 Carregando dados da home em paralelo...');
      
      const [
        { data: newWidgets },
        { data: stickersData },
        { data: bgData },
        { data: guestbookData }
      ] = await Promise.all([
        // Widgets
        supabase
          .from('user_home_widgets')
          .select('*')
          .eq('user_id', userId)
          .eq('is_visible', true),
        
        // Stickers
        supabase
          .from('user_stickers')
          .select('*')
          .eq('user_id', userId),
        
        // Background
        supabase
          .from('user_home_backgrounds')
          .select('*')
          .eq('user_id', userId)
          .single(),
        
        // Guestbook
        supabase
          .from('guestbook_entries')
          .select('*')
          .eq('home_owner_user_id', userId)
          .eq('moderation_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Processar widgets
      let widgetsData: Widget[] = [];
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
      }

      console.log('📦 Widgets carregados:', widgetsData);
      
      // Garantir que existe um widget avatar e está centralizado (só para o proprietário)
      const avatarWidget = widgetsData.find(w => w.widget_type === 'avatar');
      if (currentUserIsOwner && !avatarWidget) {
        console.log('🎯 Criando widget avatar automaticamente...');
        const centerX = 384;
        const centerY = 100;
        
        const newAvatarWidget: Widget = {
          id: `avatar-${userId}`,
          widget_type: 'avatar',
          x: centerX,
          y: centerY,
          z_index: 1,
          width: 300,
          height: 150,
          is_visible: true,
          config: {}
        };
        
        // Criar em background sem bloquear o carregamento
        supabase
          .from('user_home_widgets')
          .insert({
            user_id: userId,
            widget_type: 'avatar',
            x: centerX,
            y: centerY,
            z_index: 1,
            width: 300,
            height: 150,
            is_visible: true,
            config: {}
          })
          .then(() => console.log('✅ Widget avatar criado'));
          
        widgetsData.push(newAvatarWidget);
      }
      
      setWidgets(widgetsData);

      // Processar stickers
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

      // Processar background
      if (bgData) {
        setBackground({
          background_type: bgData.background_type as 'color' | 'cover' | 'repeat',
          background_value: bgData.background_value
        });
        console.log('🎨 Background carregado:', bgData);
      }

      // Processar guestbook
      if (guestbookData) {
        setGuestbook(guestbookData);
        console.log('📝 Guestbook carregado:', guestbookData);
      }

      console.log('✅ Dados da home carregados com sucesso');
      setLoading(false);

      // 4. Carregar perfil do Habbo em background (não-bloqueante)
      loadHabboProfile(userData, basicHabboInfo);
    } catch (error) {
      console.error('❌ Erro ao carregar dados da Habbo Home:', error);
      setLoading(false);
    }
  };

  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    try {
      // Atualizar na estrutura nova
      await supabase
        .from('user_home_widgets')
        .update({ x, y })
        .eq('user_id', habboData.id)
        .eq('id', widgetId);

      // Atualizar na estrutura antiga para compatibilidade
      await supabase
        .from('user_home_layouts')
        .update({ x, y })
        .eq('user_id', habboData.id)
        .eq('widget_id', widgetId);

      // Atualizar estado local
      setWidgets(prev => 
        prev.map(widget => 
          widget.id === widgetId ? { ...widget, x, y } : widget
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
    if (!isOwner || !habboData) {
      console.error('❌ Cannot add sticker: not owner or no habbo data', { 
        isOwner, 
        hasHabboData: !!habboData,
        habboDataId: habboData?.id 
      });
      return false;
    }

    try {
      console.log('🎯 Tentando adicionar sticker:', { 
        stickerId, 
        stickerSrc, 
        category, 
        x: Math.round(x), 
        y: Math.round(y),
        userId: habboData.id,
        currentStickersCount: stickers.length 
      });
      
      // Calculate next z-index
      const nextZ = Math.max(0, ...stickers.map(s => s.z_index || 0), ...widgets.map(w => w.z_index || 0)) + 1;
      
      // Centralizar na home (540px x 900px é o centro de 1080px x 1800px)
      const centerX = 540;
      const centerY = 900;
      
      const payload = {
        user_id: habboData.id,
        sticker_id: stickerId,
        sticker_src: stickerSrc,
        category: category || 'outros',
        x: centerX,
        y: centerY,
        z_index: nextZ,
        rotation: 0,
        scale: 1.0
      };

      console.log('📦 Payload para inserção:', payload);

      const { data, error } = await supabase
        .from('user_stickers')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase ao inserir sticker:', error);
        return false;
      }

      if (!data) {
        console.error('❌ Nenhum dado retornado após inserção');
        return false;
      }

      console.log('✅ Sticker inserido com sucesso no banco:', data);
      
      // Create new sticker object for local state
      const newSticker: Sticker = {
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
      
      console.log('📌 Novo sticker formatado:', newSticker);
      
      // Update local state
      setStickers(prev => {
        const updated = [...prev, newSticker];
        console.log('🔄 Estado dos stickers atualizado:', { 
          before: prev.length, 
          after: updated.length,
          newSticker: newSticker 
        });
        return updated;
      });
      
      // Scroll para o sticker recém adicionado após um delay
      setTimeout(() => {
        const stickerElement = document.querySelector(`[data-sticker-id="${data.id}"]`);
        if (stickerElement) {
          stickerElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }
      }, 100);
      
      console.log('✅ Sticker adicionado com sucesso!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro inesperado ao adicionar sticker:', error);
      return false;
    }
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

  const addWidget = async (widgetType: string): Promise<boolean> => {
    if (!isOwner || !habboData) {
      console.error('❌ Cannot add widget: not owner or no habbo data');
      return false;
    }

    // Check if widget already exists
    const existingWidget = widgets.find(w => w.widget_type === widgetType);
    if (existingWidget) {
      console.log(`⚠️ Widget ${widgetType} já existe`);
      return false;
    }

    try {
      console.log(`🔧 Adicionando widget: ${widgetType}`);
      
      const x = Math.random() * (1080 - 300) + 50;
      const y = Math.random() * (1800 - 200) + 50;
      const nextZ = Math.max(0, ...widgets.map(w => w.z_index || 0), ...stickers.map(s => s.z_index || 0)) + 1;
      
      const payload = {
        user_id: habboData.id,
        widget_type: widgetType,
        x: Math.round(x),
        y: Math.round(y),
        z_index: nextZ,
        width: 320,
        height: widgetType === 'guestbook' ? 380 : 160,
        is_visible: true,
        config: {}
      };

      console.log('📦 Payload do widget:', payload);

      const { data, error } = await supabase
        .from('user_home_widgets')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase ao inserir widget:', error);
        return false;
      }

      if (!data) {
        console.error('❌ Nenhum dado retornado após inserção do widget');
        return false;
      }

      console.log('✅ Widget inserido com sucesso no banco:', data);

      const newWidget: Widget = {
        id: data.id,
        widget_type: data.widget_type,
        x: data.x,
        y: data.y,
        z_index: data.z_index,
        width: data.width,
        height: data.height,
        is_visible: data.is_visible,
        config: data.config
      };
      
      setWidgets(prev => {
        const updated = [...prev, newWidget];
        console.log('🔄 Estado dos widgets atualizado:', { 
          before: prev.length, 
          after: updated.length,
          newWidget: newWidget 
        });
        return updated;
      });
      
      console.log(`✅ Widget ${widgetType} adicionado com sucesso!`);
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao adicionar widget:', error);
      return false;
    }
  };

  const removeWidget = async (widgetId: string) => {
    if (!isOwner || !habboData) return;

    try {
      // Find the widget to check its type
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) return;

      // For guestbook and rating widgets, just hide them (preserve data)
      if (widget.widget_type === 'guestbook' || widget.widget_type === 'rating') {
        await supabase
          .from('user_home_widgets')
          .update({ is_visible: false })
          .eq('id', widgetId)
          .eq('user_id', habboData.id);

        setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
        console.log(`🙈 Widget ${widget.widget_type} ocultado (dados preservados)`);
      } else {
        // For other widgets, delete normally
        await supabase
          .from('user_home_widgets')
          .delete()
          .eq('id', widgetId)
          .eq('user_id', habboData.id);

        setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
        console.log(`🗑️ Widget ${widget.widget_type} removido completamente`);
      }
    } catch (error) {
      console.error('❌ Erro ao remover widget:', error);
    }
  };

  const updateBackground = async (bgType: 'color' | 'cover' | 'repeat', bgValue: string) => {
    if (!isOwner || !habboData) {
      console.error('❌ Cannot update background: not owner or no habbo data', { 
        isOwner, 
        hasHabboData: !!habboData 
      });
      return;
    }

    try {
      console.log('🎨 Iniciando updateBackground:', { bgType, bgValue, userId: habboData.id });
      
      const { data, error } = await supabase
        .from('user_home_backgrounds')
        .upsert({
          user_id: habboData.id,
          background_type: bgType,
          background_value: bgValue
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('❌ Erro do Supabase ao atualizar background:', error);
        return;
      }

      console.log('✅ Background atualizado no banco:', data);

      setBackground({
        background_type: bgType,
        background_value: bgValue
      });

      console.log('✅ Estado local do background atualizado!');
    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar background:', error);
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
    addWidget,
    removeWidget,
    reloadData: loadHabboHomeData
  };
};
