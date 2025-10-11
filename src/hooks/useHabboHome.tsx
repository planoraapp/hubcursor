import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { HabboData, GuestbookEntry, Background, Sticker, Widget } from '@/types/habbo';

export const useHabboHome = (username: string, hotel: string = 'br') => {
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
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { habboAccount } = useAuth();
  const queryClient = useQueryClient();
  const pendingChangesRef = useRef<{
    widgets?: Widget[];
    stickers?: Sticker[];
    background?: Background;
    guestbook?: GuestbookEntry[];
  }>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // CARREGAR DADOS DA HOME
  // ============================================
  const loadHabboHomeData = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        console.error('❌ Supabase não disponível');
        setLoading(false);
        return;
      }

      // Validar username
      if (!username || typeof username !== 'string' || username.trim() === '') {
        console.error('❌ Username inválido:', username);
        setLoading(false);
        return;
      }

      // 1. Buscar dados da conta no Supabase (por nome E hotel)
      // IMPORTANTE: Buscar com o hotel exatamente como está no banco (br, com, es, etc)
      // NÃO normalizar para com.br
      
      console.log('🔍 Buscando usuário:', { 
        username, 
        hotel: hotel,
        usernameType: typeof username
      });
      
      // Buscar com CASE-SENSITIVE (nomes Habbo são case-sensitive!)
      const { data: accountsData, error: accountError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('habbo_name', username)
        .eq('hotel', hotel);

      if (accountError) {
        console.error('❌ Erro ao buscar usuário:', accountError);
        setLoading(false);
        return;
      }

      // Verificar resultados
      if (!accountsData || accountsData.length === 0) {
        // DEBUG: Tentar buscar case-insensitive para ver se existe com outra capitalização
        const { data: debugData } = await supabase
          .from('habbo_accounts')
          .select('habbo_name, hotel')
          .ilike('habbo_name', username)
          .eq('hotel', hotel);
        
        console.error('❌ Usuário não encontrado:', { 
          buscado: username, 
          hotel: hotel,
          encontradosComOutraCapitalizacao: debugData?.map(d => d.habbo_name) || []
        });
        setLoading(false);
        return;
      }

      // Se houver múltiplos resultados (usuário em vários hotéis), precisamos do hotel
      if (accountsData.length > 1) {
        console.warn(`⚠️ Múltiplos usuários encontrados com nome "${username}":`, 
          accountsData.map(acc => ({ name: acc.habbo_name, hotel: acc.hotel }))
        );
      }

      // Pegar o resultado do hotel especificado
      const habboAccountData = accountsData[0];
      
      console.log('✅ Usuário encontrado:', { 
        habbo_name: habboAccountData.habbo_name, 
        hotel: habboAccountData.hotel,
        userId: habboAccountData.supabase_user_id,
        totalResultados: accountsData.length
      });

      // 2. Configurar dados do usuário
      const userHabboData: HabboData = {
        id: habboAccountData.id,
        supabase_user_id: habboAccountData.supabase_user_id,
        habbo_name: habboAccountData.habbo_name,
        habbo_id: habboAccountData.habbo_id,
        hotel: habboAccountData.hotel || 'br',
        motto: habboAccountData.motto || '',
        figure_string: habboAccountData.figure_string || '',
        is_online: habboAccountData.is_online || false,
        member_since: habboAccountData.created_at || ''
      };

      setHabboData(userHabboData);

      // 3. Verificar se é proprietário (nome E hotel devem coincidir - CASE-SENSITIVE)
      const currentUserIsOwner = 
        habboAccount?.habbo_name === username &&
        habboAccount?.hotel === hotel;
      setIsOwner(currentUserIsOwner);
      
      console.log('🔍 Home carregando:', {
        usuario: username,
        hotel: hotel,
        proprietario: currentUserIsOwner,
        userId: userHabboData.supabase_user_id
      });

      // 4. Carregar dados da home em paralelo
      const userId = userHabboData.supabase_user_id;
      
      const [
        { data: widgetsData },
        { data: stickersData },
        { data: bgData },
        { data: guestbookData }
      ] = await Promise.all([
        supabase.from('user_home_widgets').select('*').eq('user_id', userId).eq('is_visible', true),
        supabase.from('user_stickers').select('*').eq('user_id', userId),
        supabase.from('user_home_backgrounds').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('guestbook_entries').select('*').eq('home_owner_user_id', userId).eq('moderation_status', 'approved').order('created_at', { ascending: false }).limit(20)
      ]);

      // 5. Processar widgets
      if (widgetsData && widgetsData.length > 0) {
        setWidgets(widgetsData.map(w => ({
          id: w.id,
          widget_type: w.widget_type,
          x: w.x,
          y: w.y,
          z_index: w.z_index,
          width: w.width,
          height: w.height,
          is_visible: w.is_visible,
          config: w.config
        })));
      } else {
        // Se não tem widgets, criar um widget profile padrão padronizado
        const defaultProfileWidget: Widget = {
          id: `profile-${userId}`,
          widget_type: 'profile',
          x: 20,
          y: 20,
          z_index: 1,
          width: 400,
          height: 200,
          is_visible: true,
          config: {}
        };
        setWidgets([defaultProfileWidget]);
      }

      // 6. Processar stickers
      if (stickersData && stickersData.length > 0) {
        setStickers(stickersData.map(s => ({
          id: s.id,
          sticker_id: s.sticker_id,
          x: s.x,
          y: s.y,
          z_index: s.z_index,
          scale: Number(s.scale) || 1,
          rotation: s.rotation || 0,
          sticker_src: s.sticker_src,
          category: s.category || 'outros'
        })));
      }

      // 7. Processar background
      if (bgData) {
        const bg = {
          background_type: bgData.background_type as 'color' | 'cover' | 'repeat' | 'image',
          background_value: bgData.background_value
        };
        setBackground(bg);
        console.log('🎨 Background carregado:', bg);
      } else {
        console.log('⚠️ Nenhum background encontrado no banco, usando padrão');
      }

      // 8. Processar guestbook
      if (guestbookData && guestbookData.length > 0) {
        setGuestbook(guestbookData.map(entry => ({
          id: entry.id,
          author_habbo_name: entry.author_habbo_name,
          message: entry.message,
          created_at: entry.created_at
        })));
      }

      setLoading(false);
      console.log('✅ Home carregada:', {
        widgets: widgetsData?.length || 0,
        stickers: stickersData?.length || 0,
        hasBackground: !!bgData,
        backgroundType: bgData?.background_type,
        guestbookEntries: guestbookData?.length || 0
      });

    } catch (error) {
      console.error('❌ Erro ao carregar home:', error);
      setLoading(false);
    }
  };

  // ============================================
  // SALVAMENTO COM DEBOUNCE
  // ============================================
  const saveChanges = useCallback(async () => {
    if (!isOwner || !habboData || !supabase) {
      console.warn('⚠️ Não pode salvar:', { isOwner, hasHabboData: !!habboData, hasSupabase: !!supabase });
      return;
    }
    
    const changes = pendingChangesRef.current;
    if (!changes.widgets && !changes.stickers && !changes.background) {
      return;
    }

    setIsSaving(true);
    console.log('💾 Salvando mudanças...', { 
      changes: Object.keys(changes),
      userId: habboData.supabase_user_id,
      username: habboData.habbo_name
    });

    try {
      // Salvar widgets se houver mudanças
      if (changes.widgets) {
        for (const widget of changes.widgets) {
          const { data, error } = await supabase
            .from('user_home_widgets')
            .update({ 
              x: widget.x, 
              y: widget.y,
              updated_at: new Date().toISOString()
            })
            .eq('id', widget.id)
            .eq('user_id', habboData.supabase_user_id);
          
          if (error) {
            console.error('❌ Erro ao salvar widget:', { 
              widgetId: widget.id,
              widgetType: widget.widget_type,
              error: error.message,
              userId: habboData.supabase_user_id
            });
          } else {
            console.log('✅ Widget salvo:', { 
              widgetId: widget.id,
              widgetType: widget.widget_type,
              position: { x: widget.x, y: widget.y }
            });
          }
        }
        console.log(`✅ ${changes.widgets.length} widgets processados`);
      }

      // Salvar stickers se houver mudanças
      if (changes.stickers) {
        for (const sticker of changes.stickers) {
          const { data, error } = await supabase
            .from('user_stickers')
            .update({ 
              x: sticker.x, 
              y: sticker.y,
              z_index: sticker.z_index,
              updated_at: new Date().toISOString()
            })
            .eq('id', sticker.id)
            .eq('user_id', habboData.supabase_user_id);
          
          if (error) {
            console.error('❌ Erro ao salvar sticker:', { 
              stickerId: sticker.id,
              error: error.message,
              userId: habboData.supabase_user_id
            });
          } else {
            console.log('✅ Sticker salvo:', { 
              stickerId: sticker.id,
              position: { x: sticker.x, y: sticker.y, z: sticker.z_index }
            });
          }
        }
        console.log(`✅ ${changes.stickers.length} stickers processados`);
      }

      setLastSaved(new Date());
      pendingChangesRef.current = {};
      
      // Invalidar cache dos cards
      queryClient.invalidateQueries({ queryKey: ['latest-homes-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['latest-homes'] });

      console.log('✅ Todas as mudanças salvas!');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isOwner, habboData, supabase, queryClient]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges();
    }, 2000);
  }, [saveChanges]);

  // ============================================
  // WIDGETS
  // ============================================
  const updateWidgetPosition = useCallback(async (widgetId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    setWidgets(prev => {
      const updated = prev.map(widget => 
        widget.id === widgetId ? { ...widget, x, y } : widget
      );
      pendingChangesRef.current.widgets = updated;
      scheduleSave();
      return updated;
    });
  }, [isOwner, habboData, scheduleSave]);

  const addWidget = async (widgetType: string): Promise<boolean> => {
    if (!isOwner || !habboData || !supabase) return false;

    try {
      const nextZ = Math.max(0, ...widgets.map(w => w.z_index || 0)) + 1;
      
      // Dimensões padronizadas por tipo de widget
      const widgetDimensions: Record<string, { width: number; height: number }> = {
        profile: { width: 400, height: 200 },
        guestbook: { width: 350, height: 400 },
        rating: { width: 200, height: 180 },
        badges: { width: 300, height: 200 },
        friends: { width: 300, height: 300 },
        default: { width: 300, height: 200 }
      };
      
      const dimensions = widgetDimensions[widgetType] || widgetDimensions.default;
      
      const { data, error } = await supabase
        .from('user_home_widgets')
        .insert({
          user_id: habboData.supabase_user_id,
          widget_type: widgetType,
          x: 50,
          y: 50,
          z_index: nextZ,
          width: dimensions.width,
          height: dimensions.height,
          is_visible: true,
          config: {}
        })
        .select()
        .single();

      if (error || !data) {
        console.error('❌ Erro ao criar widget:', error);
        return false;
      }

      setWidgets(prev => [...prev, data as Widget]);
      console.log(`✅ Widget ${widgetType} criado`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar widget:', error);
      return false;
    }
  };

  const removeWidget = async (widgetId: string) => {
    if (!isOwner || !habboData || !supabase) return;

    try {
      const { error } = await supabase
        .from('user_home_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', habboData.id);

      if (error) {
        console.error('❌ Erro ao remover widget:', error);
        return;
      }

      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      console.log(`✅ Widget ${widgetId} removido`);
    } catch (error) {
      console.error('❌ Erro ao remover widget:', error);
    }
  };

  // ============================================
  // STICKERS
  // ============================================
  const updateStickerPosition = useCallback(async (stickerId: string, x: number, y: number) => {
    if (!isOwner || !habboData) return;

    setStickers(prev => {
      const updated = prev.map(sticker => 
        sticker.id === stickerId ? { ...sticker, x, y } : sticker
      );
      pendingChangesRef.current.stickers = updated;
      scheduleSave();
      return updated;
    });
  }, [isOwner, habboData, scheduleSave]);

  const addSticker = async (stickerId: string, x: number, y: number, stickerSrc: string, category: string) => {
    if (!isOwner || !habboData || !supabase) return false;

    try {
      const nextZ = Math.max(0, ...stickers.map(s => s.z_index || 0), ...widgets.map(w => w.z_index || 0)) + 1;
      
      const { data, error } = await supabase
        .from('user_stickers')
        .insert({
          user_id: habboData.supabase_user_id,
          sticker_id: stickerId,
          sticker_src: stickerSrc,
          category: category || 'outros',
          x: 20,
          y: 20,
          z_index: nextZ,
          rotation: 0,
          scale: 1.0
        })
        .select()
        .single();

      if (error || !data) {
        console.error('❌ Erro ao criar sticker:', error);
        return false;
      }

      setStickers(prev => [...prev, data as Sticker]);
      console.log(`✅ Sticker ${stickerId} adicionado`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar sticker:', error);
      return false;
    }
  };

  const removeSticker = async (stickerId: string) => {
    if (!isOwner || !habboData || !supabase) return;

    try {
      const { error } = await supabase
        .from('user_stickers')
        .delete()
        .eq('id', stickerId)
        .eq('user_id', habboData.id);

      if (error) {
        console.error('❌ Erro ao remover sticker:', error);
        return;
      }

      setStickers(prev => prev.filter(s => s.id !== stickerId));
      console.log(`✅ Sticker ${stickerId} removido`);
    } catch (error) {
      console.error('❌ Erro ao remover sticker:', error);
    }
  };

  const bringToFront = (stickerId: string) => {
    if (!isOwner) return;

    const sticker = stickers.find(s => s.id === stickerId);
    if (!sticker) return;

    const maxZ = Math.max(0, ...stickers.map(s => s.z_index || 0), ...widgets.map(w => w.z_index || 0));
    
    // Só atualizar se não for já o maior z-index
    if (sticker.z_index !== maxZ) {
      const newZ = maxZ + 1;
      
      // Atualizar estado local imediatamente
      setStickers(prev => prev.map(s => 
        s.id === stickerId ? { ...s, z_index: newZ } : s
      ));

      // Salvar no banco em background
      debouncedSave({ stickers: [{ ...sticker, z_index: newZ }] });
    }
  };

  // ============================================
  // BACKGROUND
  // ============================================
  const updateBackground = async (bgType: 'color' | 'cover' | 'repeat' | 'image', bgValue: string) => {
    if (!isOwner || !habboData) return;

    try {
      // Atualizar estado local imediatamente
      const newBackground = {
        background_type: bgType,
        background_value: bgValue
      };
      setBackground(newBackground);

      // Salvar via edge function (TODOS os usuários)
      // Usar hotel exatamente como está no banco (br, com, es, etc)
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/sync-home-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_background',
          habbo_name: username,
          background: {
            type: bgType,
            value: bgValue,
            hotel: hotel
          }
        })
      });

      if (response.ok) {
        console.log('✅ Background salvo para todos os cards');
        
        // Invalidar cache
        queryClient.invalidateQueries({ queryKey: ['latest-homes-optimized'] });
        queryClient.invalidateQueries({ queryKey: ['latest-homes'] });
      } else {
        const error = await response.json();
        console.error('❌ Edge function falhou:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar background:', error);
    }
  };

  // ============================================
  // GUESTBOOK
  // ============================================
  const submitGuestbookMessage = async (message: string) => {
    if (!habboAccount || !habboData || !supabase) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .insert({
          home_owner_user_id: habboData.supabase_user_id,
          author_user_id: habboAccount.supabase_user_id,
          author_habbo_name: habboAccount.habbo_name,
          message: message.trim(),
          created_at: new Date().toISOString()
        })
        .select('id, author_habbo_name, message, created_at')
        .single();

      if (error) throw error;

      setGuestbook(prev => [{
        id: data.id,
        author_habbo_name: data.author_habbo_name,
        message: data.message,
        created_at: data.created_at
      }, ...prev]);
      console.log('✅ Mensagem no guestbook enviada');
      return data;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const deleteGuestbookMessage = async (entryId: string) => {
    if (!habboAccount || !supabase) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Buscar o comentário primeiro para verificar permissões
      const { data: entry, error: fetchError } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (fetchError || !entry) {
        throw new Error('Comentário não encontrado');
      }

      // Verificar permissão: deve ser autor OU dono da home
      const isAuthor = entry.author_habbo_name === habboAccount.habbo_name;
      const isHomeOwner = isOwner;
      
      if (!isAuthor && !isHomeOwner) {
        throw new Error('Você não tem permissão para deletar este comentário');
      }

      // Deletar
      const { error: deleteError } = await supabase
        .from('guestbook_entries')
        .delete()
        .eq('id', entryId);

      if (deleteError) {
        throw deleteError;
      }

      // Atualizar estado local
      setGuestbook(prev => {
        const filtered = prev.filter(e => e.id !== entryId);
        console.log('🔄 Estado atualizado:', { 
          antes: prev.length, 
          depois: filtered.length, 
          removido: entryId 
        });
        return filtered;
      });
      console.log('✅ Mensagem do guestbook removida');
      
    } catch (error) {
      console.error('❌ Erro ao deletar mensagem:', error);
      throw error;
    }
  };

  const clearAllGuestbookEntries = async () => {
    if (!habboData || !supabase) return;

    try {
      const { error } = await supabase
        .from('guestbook_entries')
        .delete()
        .eq('home_owner_user_id', habboData.supabase_user_id);

      if (error) throw error;

      setGuestbook([]);
      console.log('✅ Todos os guestbook entries removidos');
    } catch (error) {
      console.error('❌ Erro ao limpar guestbook:', error);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (username) {
      loadHabboHomeData();
    }
  }, [username, hotel]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    loading,
    isEditMode,
    isOwner,
    isSaving,
    lastSaved,
    currentUser: habboAccount,
    
    // Actions
    setIsEditMode,
    updateWidgetPosition,
    updateStickerPosition,
    addSticker,
    removeSticker,
    bringToFront,
    updateBackground,
    addWidget,
    removeWidget,
    onGuestbookSubmit: submitGuestbookMessage,
    onGuestbookDelete: deleteGuestbookMessage,
    clearAllGuestbookEntries,
    reloadData: loadHabboHomeData,
    saveChanges
  };
};

