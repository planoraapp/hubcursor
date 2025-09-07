import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useHubLogin } from './useHubLogin';

// Cliente Supabase com service_role para operações administrativas
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

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

interface HomeData {
  widgets: Widget[];
  stickers: Sticker[];
  background: Background | null;
  guestbook: any[];
}

export const useHabboHomeV2 = (username: string) => {
  const [habboData, setHabboData] = useState<HabboData | null>(null);
  const [homeData, setHomeData] = useState<HomeData>({
    widgets: [],
    stickers: [],
    background: null,
    guestbook: []
  });
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const { currentUser, isLoggedIn } = useHubLogin();

  const loadHabboHomeData = async () => {
    if (!username) return;

    setLoading(true);
    try {
      console.log('🎯 Buscando usuário:', username);

      // 1. Carregar dados do usuário Habbo (sistema novo)
      const { data: userData, error: userError } = await supabaseAdmin
        .from('hub_users')
        .select('*')
        .eq('habbo_username', username.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (userError) {
        console.error('❌ Erro na consulta:', userError);
        return;
      }

      if (!userData) {
        console.log('❌ Usuário não encontrado:', username);
        
        // Criar conta automaticamente para habbohub
        if (username.toLowerCase() === 'habbohub') {
          console.log('🔧 Criando conta habbohub automaticamente...');
          const { error: createError } = await supabaseAdmin
            .from('hub_users')
            .insert({
              habbo_username: 'habbohub',
              hotel: 'br',
              habbo_avatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=habbohub&headonly=1',
              password_hash: 'dummy_hash',
              member_since: new Date().toISOString(),
              is_active: true
            });

          if (createError) {
            console.error('❌ Erro ao criar conta habbohub:', createError);
            return;
          }

          // Recarregar dados após criação
          const { data: newUserData } = await supabaseAdmin
            .from('hub_users')
            .select('*')
            .eq('habbo_username', 'habbohub')
            .single();

          if (newUserData) {
            setHabboData({
              id: newUserData.id,
              habbo_name: newUserData.habbo_username,
              habbo_id: `hhbr-${newUserData.id}`,
              hotel: newUserData.hotel,
              motto: 'Bem-vindo ao HabboHub!',
              figure_string: 'hd-180-1.ch-255-66.lg-285-110.sh-290-62.hr-831-49',
              is_online: false,
              memberSince: newUserData.member_since
            });
            setIsOwner(currentUser?.habbo_username === 'habbohub');
          }
        }
        return;
      }

      // 2. Configurar dados do usuário
      setHabboData({
        id: userData.id,
        habbo_name: userData.habbo_username,
        habbo_id: `hhbr-${userData.id}`,
        hotel: userData.hotel,
        motto: 'Bem-vindo ao HabboHub!',
        figure_string: 'hd-180-1.ch-255-66.lg-285-110.sh-290-62.hr-831-49',
        is_online: false,
        memberSince: userData.member_since
      });

      // 3. Verificar se é o proprietário
      setIsOwner(currentUser?.habbo_username === username.toLowerCase());

      // 4. Carregar dados da home
      await loadHomeData(userData.id);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHomeData = async (userId: string) => {
    try {
      // Carregar widgets
      const { data: widgetsData } = await supabaseAdmin
        .from('user_home_widgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_visible', true)
        .order('z_index');

      // Carregar stickers
      const { data: stickersData } = await supabaseAdmin
        .from('user_stickers')
        .select('*')
        .eq('user_id', userId)
        .order('z_index');

      // Carregar background
      const { data: backgroundData } = await supabaseAdmin
        .from('user_home_backgrounds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Carregar entradas do guestbook
      const { data: guestbookData } = await supabaseAdmin
        .from('guestbook_entries')
        .select('*')
        .eq('home_owner_user_id', userId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      // Se não há widgets, criar widgets padrão
      if (!widgetsData || widgetsData.length === 0) {
        console.log('🔧 Criando widgets padrão...');
        const defaultWidgets = [
          // Card de Perfil (obrigatório) - margem esquerda e topo
          { widget_type: 'avatar', x: 25, y: 25, z_index: 1, width: 480, height: 160, is_visible: true, config: { showBadges: true, showMotto: true } },
          
          // Guestbook (opcional) - margem esquerda, abaixo do avatar
          { widget_type: 'guestbook', x: 25, y: 200, z_index: 1, width: 500, height: 300, is_visible: true, config: { maxMessages: 10, allowAnonymous: true } },
          
          // Avaliações (opcional) - margem esquerda, abaixo do guestbook
          { widget_type: 'rating', x: 25, y: 520, z_index: 1, width: 300, height: 160, is_visible: true, config: { showStars: true, allowRating: true } }
        ];

        for (const widget of defaultWidgets) {
          await supabaseAdmin
            .from('user_home_widgets')
            .insert({
              user_id: userId,
              ...widget
            });
        }

        // Recarregar widgets
        const { data: newWidgetsData } = await supabaseAdmin
          .from('user_home_widgets')
          .select('*')
          .eq('user_id', userId)
          .eq('is_visible', true)
          .order('z_index');

        setHomeData(prev => ({
          ...prev,
          widgets: newWidgetsData || []
        }));
      } else {
      setHomeData(prev => ({
        ...prev,
        widgets: widgetsData
      }));
    }

      // Se não há stickers, criar stickers padrão
      if (!stickersData || stickersData.length === 0) {
        console.log('🔧 Criando stickers padrão...');
        const defaultStickers = [
          { sticker_id: 'heart-1', sticker_src: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/stickers/heart.png', x: 100, y: 100, z_index: 2, scale: 1, rotation: 0, category: 'decoration' },
          { sticker_id: 'star-1', sticker_src: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/stickers/star.png', x: 200, y: 150, z_index: 2, scale: 1, rotation: 0, category: 'decoration' }
        ];

        for (const sticker of defaultStickers) {
          await supabaseAdmin
            .from('user_stickers')
            .insert({
              user_id: userId,
              ...sticker
            });
        }

        // Recarregar stickers
        const { data: newStickersData } = await supabaseAdmin
          .from('user_stickers')
          .select('*')
          .eq('user_id', userId)
          .order('z_index');

        setHomeData(prev => ({
          ...prev,
          stickers: newStickersData || []
        }));
      } else {
      setHomeData(prev => ({
        ...prev,
        stickers: stickersData
      }));
    }

      // Configurar background
      if (backgroundData) {
        setHomeData(prev => ({
          ...prev,
          background: {
            background_type: backgroundData.background_type,
            background_value: backgroundData.background_value
          }
        }));
      } else {
        // Background padrão
        setHomeData(prev => ({
          ...prev,
          background: {
            background_type: 'color',
            background_value: '#e8f4fd'
          }
        }));
      }

      // Configurar guestbook
      setHomeData(prev => ({
        ...prev,
        guestbook: guestbookData || []
      }));

    } catch (error) {
      console.error('❌ Erro ao carregar dados da home:', error);
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    if (!isOwner) return;

    try {
      const { error } = await supabaseAdmin
        .from('user_home_widgets')
        .update(updates)
        .eq('id', widgetId);

      if (error) throw error;

      // Atualizar estado local
      setHomeData(prev => ({
        ...prev,
        widgets: prev.widgets.map(w => 
          w.id === widgetId ? { ...w, ...updates } : w
        )
      }));
    } catch (error) {
      console.error('❌ Erro ao atualizar widget:', error);
    }
  };

  const updateSticker = async (stickerId: string, updates: Partial<Sticker>) => {
    if (!isOwner) return;

    try {
      const { error } = await supabaseAdmin
        .from('user_stickers')
        .update(updates)
        .eq('id', stickerId);

      if (error) throw error;

      // Atualizar estado local
      setHomeData(prev => ({
        ...prev,
        stickers: prev.stickers.map(s => 
          s.id === stickerId ? { ...s, ...updates } : s
        )
      }));
    } catch (error) {
      console.error('❌ Erro ao atualizar sticker:', error);
    }
  };

  const updateBackground = async (background: { background_type: 'color' | 'cover' | 'repeat', background_value: string }) => {
    if (!isOwner || !habboData) return;

    try {
      const { error } = await supabaseAdmin
        .from('user_home_backgrounds')
        .upsert({
          user_id: habboData.id,
          background_type: background.background_type,
          background_value: background.background_value
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Atualizar estado local
      setHomeData(prev => ({
        ...prev,
        background: {
          background_type: background.background_type,
          background_value: background.background_value
        }
      }));
    } catch (error) {
      console.error('❌ Erro ao atualizar background:', error);
    }
  };

  // Função para adicionar widget
  const addWidget = async (widgetType: string) => {
    console.log('📊 addWidget chamada com:', { widgetType, habboDataId: habboData?.id });
    
    if (!habboData?.id) {
      console.log('❌ habboData.id não encontrado');
      return;
    }
    
    // Gerar posição inicial na margem esquerda e topo do canvas
    const existingWidgets = homeData?.widgets || [];
    const canvasWidth = 1000;
    const canvasHeight = 1400;
    // Definir dimensões específicas para cada tipo de widget
    let widgetWidth, widgetHeight;
    
    switch (widgetType) {
      case 'avatar':
        widgetWidth = 480;
        widgetHeight = 160;
        break;
      case 'guestbook':
        widgetWidth = 500;
        widgetHeight = 300;
        break;
      case 'rating':
        widgetWidth = 300;
        widgetHeight = 160;
        break;
      default:
        widgetWidth = 200;
        widgetHeight = 100;
    }
    const margin = 25;
    
    // Posição inicial: margem esquerda e topo
    let newX = margin; // Left margin
    let newY = margin; // Top margin
    
    // Se a posição inicial estiver ocupada, encontrar uma posição livre próxima na margem esquerda
    let attempts = 0;
    const maxAttempts = 10;
    const stepY = 120; // Incremento vertical para buscar posições livres
    
    while (attempts < maxAttempts) {
      const isOccupied = existingWidgets.some(widget => 
        Math.abs(widget.x - newX) < widgetWidth && Math.abs(widget.y - newY) < widgetHeight
      );
      
      if (!isOccupied) break;
      
      // Buscar posições abaixo na margem esquerda
      newY += stepY;
      
      // Se sair do canvas, voltar para o topo
      if (newY + widgetHeight > canvasHeight - margin) {
        newY = margin;
      }
      
      attempts++;
    }
    
    // Se ainda não encontrou posição livre, usar posição na margem esquerda como fallback
    if (attempts >= maxAttempts) {
      newX = margin;
      newY = margin;
    }
    
    // Garantir que a posição final está dentro dos limites
    newX = Math.max(margin, Math.min(canvasWidth - widgetWidth - margin, newX));
    newY = Math.max(margin, Math.min(canvasHeight - widgetHeight - margin, newY));

    const newWidget = {
      widget_type: widgetType,
      x: newX,
      y: newY,
      z_index: 1,
      width: widgetWidth,
      height: widgetHeight,
      is_visible: true,
      config: {}
    };

    console.log('📊 Novo widget criado:', newWidget);

    try {
      // Verificar se já existe um widget do mesmo tipo para este usuário
      const { data: existingWidgets, error: checkError } = await supabaseAdmin
        .from('user_home_widgets')
        .select('id, widget_type')
        .eq('user_id', habboData.id)
        .eq('widget_type', widgetType);

      if (checkError) {
        console.error('❌ Erro ao verificar widgets existentes:', checkError);
        throw checkError;
      }

      let resultData = null;

      if (existingWidgets && existingWidgets.length > 0) {
        console.log('⚠️ Widget do tipo', widgetType, 'já existe para este usuário. Atualizando posição...');
        
        // Atualizar posição do widget existente
        const { data, error } = await supabaseAdmin
          .from('user_home_widgets')
          .update({
            x: newWidget.x,
            y: newWidget.y,
            z_index: newWidget.z_index,
            width: newWidget.width,
            height: newWidget.height,
            is_visible: newWidget.is_visible
          })
          .eq('id', existingWidgets[0].id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar widget existente:', error);
          throw error;
        }

        resultData = data;
        console.log('✅ Widget existente atualizado:', data);
      } else {
        // Inserir novo widget
        const { data, error } = await supabaseAdmin
          .from('user_home_widgets')
          .insert({
            user_id: habboData.id,
            ...newWidget
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erro do Supabase:', error);
          throw error;
        }

        resultData = data;
        console.log('✅ Widget inserido no banco:', data);
      }

      // Atualizar estado baseado no resultado
      setHomeData(prev => {
        if (existingWidgets && existingWidgets.length > 0) {
          // Widget existente foi atualizado
          const updatedWidgets = (prev?.widgets || []).map(w => 
            w.id === existingWidgets[0].id ? { ...w, ...resultData } : w
          );
          const newData = {
            ...prev,
            widgets: updatedWidgets
          };
          console.log('🔄 Widget existente atualizado no estado:', newData);
          return newData;
        } else {
          // Novo widget foi inserido
          const newData = {
            ...prev,
            widgets: [...(prev?.widgets || []), resultData]
          };
          console.log('🔄 Novo widget adicionado ao estado:', newData);
          return newData;
        }
      });
    } catch (error) {
      console.error('❌ Erro ao adicionar widget:', error);
    }
  };

  // Função para adicionar sticker
  const addSticker = async (stickerData: any) => {
    console.log('🎭 addSticker chamada com:', { stickerData, habboDataId: habboData?.id });
    
    if (!habboData?.id) {
      console.log('❌ habboData.id não encontrado');
      return;
    }
    
    // Gerar posição inicial no centro superior do canvas
    const existingStickers = homeData?.stickers || [];
    const canvasWidth = 1000;
    const canvasHeight = 1400;
    const stickerSize = 100;
    const margin = 25;
    
    // Posição inicial: centro superior (540, 200)
    let newX = 540;
    let newY = 200;
    
    // Se a posição inicial estiver ocupada, encontrar uma posição livre próxima
    let attempts = 0;
    const maxAttempts = 20;
    const step = 50; // Incremento para buscar posições livres
    
    while (attempts < maxAttempts) {
      const isOccupied = existingStickers.some(sticker => 
        Math.abs(sticker.x - newX) < stickerSize && Math.abs(sticker.y - newY) < stickerSize
      );
      
      if (!isOccupied) break;
      
      // Buscar posições em espiral a partir do centro superior
      const angle = (attempts * 45) * (Math.PI / 180); // 45 graus por tentativa
      const radius = Math.floor(attempts / 8) * step; // Aumentar raio a cada 8 tentativas
      
      newX = Math.round(540 + Math.cos(angle) * radius);
      newY = Math.round(200 + Math.sin(angle) * radius);
      
      attempts++;
    }
    
    // Se ainda não encontrou posição livre, usar posição aleatória como fallback
    if (attempts >= maxAttempts) {
      newX = Math.round(Math.random() * (canvasWidth - stickerSize - margin) + margin);
      newY = Math.round(Math.random() * (canvasHeight - stickerSize - margin) + margin);
    }
    
    // Garantir que a posição final está dentro dos limites
    newX = Math.max(margin, Math.min(canvasWidth - stickerSize - margin, newX));
    newY = Math.max(margin, Math.min(canvasHeight - stickerSize - margin, newY));

    const newSticker = {
      sticker_id: stickerData.sticker_id || `sticker-${Date.now()}`,
      sticker_src: stickerData.sticker_src || '/assets/frank.png',
      x: Math.round(stickerData.x || newX),
      y: Math.round(stickerData.y || newY),
      z_index: 10,
      scale: stickerData.scale || 1,
      rotation: stickerData.rotation || 0,
      category: stickerData.category || 'decoration'
    };

    console.log('🎭 URL do sticker:', {
      original: stickerData.sticker_src,
      final: newSticker.sticker_src,
      isSupabaseUrl: newSticker.sticker_src?.includes('supabase.co')
    });

    console.log('🎭 Novo sticker criado:', newSticker);

    try {
      console.log('🎭 Tentando inserir no banco:', {
        user_id: habboData.id,
        ...newSticker
      });

      const { data, error } = await supabaseAdmin
        .from('user_stickers')
        .insert({
          user_id: habboData.id,
          ...newSticker
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        console.error('❌ Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Sticker inserido no banco:', data);

      setHomeData(prev => {
        console.log('🔄 Estado anterior:', prev);
        console.log('🔄 Stickers anteriores:', prev?.stickers);
        console.log('🔄 Novo sticker a ser adicionado:', data);
        
        const newData = {
          ...prev,
          stickers: [...(prev?.stickers || []), data]
        };
        
        console.log('🔄 Estado novo:', newData);
        console.log('🔄 Stickers novos:', newData.stickers);
        return newData;
      });
    } catch (error) {
      console.error('❌ Erro ao adicionar sticker:', error);
    }
  };

  // Função para remover widget
  const removeWidget = async (widgetId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('user_home_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;

      setHomeData(prev => ({
        ...prev,
        widgets: (prev?.widgets || []).filter(w => w.id !== widgetId)
      }));
    } catch (error) {
      console.error('❌ Erro ao remover widget:', error);
    }
  };

  // Função para remover sticker
  const removeSticker = async (stickerId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('user_stickers')
        .delete()
        .eq('id', stickerId);

      if (error) throw error;

      setHomeData(prev => ({
        ...prev,
        stickers: (prev?.stickers || []).filter(s => s.id !== stickerId)
      }));
    } catch (error) {
      console.error('❌ Erro ao remover sticker:', error);
    }
  };

  // Função para atualizar posição do widget
  const updateWidgetPosition = async (widgetId: string, x: number, y: number) => {
    try {
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      
      console.log('📊 Atualizando posição do widget:', { widgetId, x, y, roundedX, roundedY });
      
      const { error } = await supabaseAdmin
        .from('user_home_widgets')
        .update({ x: roundedX, y: roundedY })
        .eq('id', widgetId);

      if (error) throw error;

      console.log('✅ Posição do widget salva no banco:', { widgetId, x: roundedX, y: roundedY });

      setHomeData(prev => ({
        ...prev,
        widgets: (prev?.widgets || []).map(w => 
          w.id === widgetId ? { ...w, x: roundedX, y: roundedY } : w
        )
      }));
      
      console.log('🔄 Estado local atualizado para widget:', widgetId);
    } catch (error) {
      console.error('❌ Erro ao atualizar posição do widget:', error);
    }
  };

  // Função para atualizar posição do sticker
  const updateStickerPosition = async (stickerId: string, x: number, y: number) => {
    try {
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      
      console.log('🎯 Atualizando posição do sticker:', { stickerId, x, y, roundedX, roundedY });
      
      const { error } = await supabaseAdmin
        .from('user_stickers')
        .update({ x: roundedX, y: roundedY })
        .eq('id', stickerId);

      if (error) throw error;

      console.log('✅ Posição do sticker salva no banco:', { stickerId, x: roundedX, y: roundedY });

      setHomeData(prev => ({
        ...prev,
        stickers: (prev?.stickers || []).map(s => 
          s.id === stickerId ? { ...s, x: roundedX, y: roundedY } : s
        )
      }));
      
      console.log('🔄 Estado local atualizado para sticker:', stickerId);
    } catch (error) {
      console.error('❌ Erro ao atualizar posição do sticker:', error);
    }
  };

  // Função para reposicionar elementos existentes para o canto lateral esquerdo
  const repositionExistingElements = async (userId: string, widgets: Widget[]) => {
    try {
      console.log('🔄 Reposicionando elementos existentes para o canto lateral esquerdo...');
      
      const canvasWidth = 1000;
      const canvasHeight = 1400;
      const leftMargin = 50; // Margem esquerda
      const topStart = Math.floor(canvasHeight * 0.3); // Começar do meio para cima (30% da altura)
      const spacing = 20; // Espaçamento entre elementos
      
      let currentY = topStart;
      
      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        const newX = leftMargin;
        const newY = currentY;
        
        console.log(`📊 Reposicionando widget ${widget.id} (${widget.widget_type}):`, { 
          oldX: widget.x, oldY: widget.y, 
          newX, newY 
        });
        
        // Atualizar no banco
        await supabaseAdmin
          .from('user_home_widgets')
          .update({ x: newX, y: newY })
          .eq('id', widget.id);
        
        // Atualizar estado local
        setHomeData(prev => ({
          ...prev,
          widgets: (prev?.widgets || []).map(w => 
            w.id === widget.id ? { ...w, x: newX, y: newY } : w
          )
        }));
        
        // Próxima posição Y (altura do widget + espaçamento)
        currentY += widget.height + spacing;
      }
      
      console.log('✅ Elementos reposicionados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao reposicionar elementos:', error);
    }
  };

  // Função para reposicionar stickers existentes para o canto lateral esquerdo
  const repositionExistingStickers = async (userId: string, stickers: Sticker[]) => {
    try {
      console.log('🔄 Reposicionando stickers existentes para o canto lateral esquerdo...');
      
      const canvasWidth = 1000;
      const canvasHeight = 1400;
      const leftMargin = 50; // Margem esquerda
      const topStart = Math.floor(canvasHeight * 0.3); // Começar do meio para cima (30% da altura)
      const stickerSize = 100;
      const spacing = 20; // Espaçamento entre stickers
      
      let currentY = topStart;
      
      for (let i = 0; i < stickers.length; i++) {
        const sticker = stickers[i];
        const newX = leftMargin;
        const newY = currentY;
        
        console.log(`🎯 Reposicionando sticker ${sticker.id}:`, { 
          oldX: sticker.x, oldY: sticker.y, 
          newX, newY 
        });
        
        // Atualizar no banco
        await supabaseAdmin
          .from('user_stickers')
          .update({ x: newX, y: newY })
          .eq('id', sticker.id);
        
        // Atualizar estado local
        setHomeData(prev => ({
          ...prev,
          stickers: (prev?.stickers || []).map(s => 
            s.id === sticker.id ? { ...s, x: newX, y: newY } : s
          )
        }));
        
        // Próxima posição Y (tamanho do sticker + espaçamento)
        currentY += stickerSize + spacing;
      }
      
      console.log('✅ Stickers reposicionados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao reposicionar stickers:', error);
    }
  };

  useEffect(() => {
    loadHabboHomeData();
  }, [username, currentUser]);

  return {
    habboData,
    homeData,
    loading,
    isOwner,
    updateWidget,
    updateSticker,
    updateBackground,
    addWidget,
    addSticker,
    removeWidget,
    removeSticker,
    updateWidgetPosition,
    updateStickerPosition,
    reload: loadHabboHomeData
  };
};