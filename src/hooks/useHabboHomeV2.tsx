import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { unifiedHabboService } from '@/services/unifiedHabboService';
import { habboCache } from '@/services/habboCache';
import { useUserProfile } from './useUserProfile';
import { useHabboPublicData } from './useHabboPublicData';

import type { HabboData, GuestbookEntry, Background, Sticker, Widget } from '@/types/habbo';
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

  // Usar dados internos para usuários normais
  const { habboUser, habboProfile, isLoading: profileLoading } = useUserProfile(username);
  
  // Usar dados públicos das APIs do Habbo apenas para usuários que não sejam habbohub
  const { 
    data: habboPublicData, 
    avatarUrl: habboAvatarUrl, 
    isLoading: publicDataLoading 
  } = useHabboPublicData(
    username.toLowerCase() === 'habbohub' ? '' : username, 
    'com.br'
  );

  // Função para buscar dados reais do habbohub incluindo data de criação
  const fetchRealHabboData = async () => {
    try {
      let realMemberSince = '2024-01-01T00:00:00.000Z'; // Fallback
      let realMotto = 'HUB-QQ797';
      let realFigureString = 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408';
      let realIsOnline = false;
      
      // Tentar múltiplas APIs do Habbo
      const apiUrls = [
        'https://www.habbo.com.br/api/public/users?name=habbohub',
        'https://www.habbo.com.br/api/public/users/habbohub/profile',
        'https://www.habbo.com.br/api/public/users/habbohub'
      ];
      
      for (const url of apiUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'HabboHub/1.0'
            }
          });
          
          if (response.ok) {
            const apiData = await response.json();
            
            // Tentar extrair dados do usuário
            const userData = apiData.user || apiData;
            
            // Buscar data de criação
            const possibleDateFields = ['memberSince', 'registeredDate', 'createdAt', 'joinDate', 'registrationDate', 'member_since'];
            for (const field of possibleDateFields) {
              if (userData && userData[field]) {
                realMemberSince = userData[field];
                break;
              }
            }
            
            // Buscar motto
            if (userData && userData.motto) {
              realMotto = userData.motto;
            }
            
            // Buscar figure string
            if (userData && userData.figureString) {
              realFigureString = userData.figureString;
            }
            
            // Buscar status online
            if (userData && userData.online !== undefined) {
              realIsOnline = userData.online;
            }
            
            // Se encontrou dados, parar de tentar outras APIs
            if (realMemberSince !== '2024-01-01T00:00:00.000Z') {
              break;
            }
          }
        } catch (apiError) {
          // Silenciar erros de API para produção
        }
      }
      
      // Dados reais do habbohub
      const realHabboData: HabboData = {
        id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
        habbo_name: 'habbohub',
        habbo_id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
        hotel: 'br',
        motto: realMotto,
        figure_string: realFigureString,
        is_online: realIsOnline,
        memberSince: realMemberSince
      };
      
      // Sempre atualizar com dados reais, mesmo se há dados salvos
      setHabboData(realHabboData);
      
    } catch (error) {
            // Fallback com dados básicos se a busca falhar
      const fallbackData: HabboData = {
        id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
        habbo_name: 'habbohub',
        habbo_id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
        hotel: 'br',
        motto: 'HUB-QQ797',
        figure_string: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
        is_online: false,
        memberSince: '2024-01-01T00:00:00.000Z'
      };
      
      // Sempre atualizar com dados de fallback se a busca real falhar
      setHabboData(fallbackData);
    }
  };

  // Configurar dados reais do habbohub diretamente
  useEffect(() => {
    if (username.toLowerCase() === 'habbohub') {
            // Aguardar um pouco para garantir que os dados salvos sejam carregados primeiro
      setTimeout(() => {
        fetchRealHabboData();
      }, 500);
      
      // Forçar atualização do card se já existir
      setTimeout(() => {
        if (widgets.length > 0) {
          const updatedWidgets = widgets.map(widget => {
            if (widget.widget_type === 'profile') {
              return {
                ...widget,
                width: 350,
                config: {
                  ...widget.config,
                  profileSize: {
                    width: '350px',
                    height: '180px'
                  }
                }
              };
            }
            return widget;
          });
          setWidgets(updatedWidgets);
                  }
      }, 100);
    }
  }, [username]);

  // Função para carregar perfil do Habbo em background
  const loadHabboProfile = async (userData: any, currentHabboInfo: HabboData) => {
    try {
      const hotel = userData.hotel === 'br' ? 'com.br' : (userData.hotel || 'com.br');
      
      // Verificar cache primeiro
      const cachedProfile = habboCache.get(userData.habbo_name, hotel);
      if (cachedProfile) {
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
            const profileData = await unifiedHabboService.getUserProfile(userData.habbo_name, hotel);
      
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
              }
    } catch (error) {
      console.warn('⚠️ Falha ao carregar perfil do Habbo (não crítico):', error);
    }
  };
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Refs para debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<{
    widgets?: Widget[];
    stickers?: Sticker[];
    background?: Background;
    guestbook?: any[];
  }>({});

  const { habboAccount, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  
  // Debug logs removidos para produção - mantendo apenas logs críticos

  // Função para carregar dados salvos do localStorage
  const loadLocalHomeData = (username: string) => {
    try {
      const storageKey = `habbohub_home_${username.toLowerCase()}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const homeData = JSON.parse(savedData);
                return homeData;
      } else {
              }
    } catch (error) {
          }
    return null;
  };

  // Função para garantir que o card de perfil sempre existe
  const ensureProfileCard = (currentWidgets: Widget[], userId: string) => {
    const hasProfileCard = currentWidgets.some(widget => 
      widget.widget_type === 'profile' || widget.widget_type === 'avatar'
    );
    
    if (!hasProfileCard) {
            const profileCard: Widget = {
        id: `profile-${userId}`,
        widget_type: 'profile',
        x: 20,
        y: 20,
        z_index: 1,
        width: 350,
        height: 180,
        is_visible: true,
        config: {
          profileSize: {
            width: '350px',
            height: '180px'
          }
        }
      };
      
            return [profileCard, ...currentWidgets];
    }
    
        return currentWidgets;
  };

  const loadHabboHomeData = async () => {
    try {
      setLoading(true);
            // Atualizar guestbooks existentes para o novo tamanho
      if (username.toLowerCase() === 'habbohub') {
        try {
          await supabase
            .from('user_home_widgets')
            .update({ 
              width: 350, 
              height: 400,
              updated_at: new Date().toISOString()
            })
            .eq('widget_type', 'guestbook');
                  } catch (error) {
                  }
      }

      // Para usuários fictícios, verificar localStorage primeiro
      if (username.toLowerCase() === 'habbohub' || username.toLowerCase() === 'beebop') {
        const savedData = loadLocalHomeData(username);
        
        // Configurar dados básicos do usuário
        const basicHabboInfo: HabboData = {
          id: username.toLowerCase() === 'habbohub' ? 'hhbr-81b7220d11b7a21997226bf7cfcbad51' : 'hhbr-beebop-user-id-67890',
          habbo_name: username,
          habbo_id: username.toLowerCase() === 'habbohub' ? 'hhbr-81b7220d11b7a21997226bf7cfcbad51' : 'hhbr-beebop-user-id-67890',
          hotel: 'br',
          motto: username.toLowerCase() === 'habbohub' ? 'HUB-QQ797' : 'Desenvolvedor e Designer do HabboHub',
          figure_string: username.toLowerCase() === 'habbohub' ? 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408' : 'hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61',
          is_online: username.toLowerCase() === 'habbohub' ? false : true,
          memberSince: username.toLowerCase() === 'habbohub' ? '' : '2024'
        };
        
        setHabboData(basicHabboInfo);
        
        // Definir como proprietário se o usuário logado for o mesmo (extraindo nome do Habbo)
        const currentUserHabboName = habboAccount?.habbo_username?.split('-').pop()?.toLowerCase();
        const currentUserIsOwner = currentUserHabboName === username.toLowerCase();
        setIsOwner(currentUserIsOwner);
        
        if (savedData) {
                                        // Carregar dados salvos e garantir que há um card de perfil
          const savedWidgets = savedData.widgets || [];
          const widgetsWithProfile = ensureProfileCard(savedWidgets, basicHabboInfo.id);
          
          setWidgets(widgetsWithProfile);
          setStickers(savedData.stickers || []);
          setBackground(savedData.background || { background_type: 'image', background_value: '/assets/bghabbohub.png' });
          setGuestbook(savedData.guestbook || []);
          
          console.log('✅ Dados carregados do localStorage:', {
            widgets: widgetsWithProfile.length,
            stickers: (savedData.stickers || []).length,
            guestbook: (savedData.guestbook || []).length,
            lastSaved: savedData.lastSaved
          });
          
          setLoading(false);
          return;
        } else {
          // Se não há dados salvos, criar widgets padrão com card de perfil
                    const defaultWidgets = [
            {
              id: `profile-${basicHabboInfo.id}`,
              widget_type: 'profile',
              x: 20,
              y: 20,
              z_index: 1,
              width: 350,
              height: 180,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            }
          ];
          
          setWidgets(defaultWidgets);
          setStickers([]);
          setBackground({ background_type: 'image', background_value: '/assets/bghabbohub.png' });
          setGuestbook([]);
          
          setLoading(false);
          return;
        }
      }

      // Verificar se Supabase está disponível
      if (!supabase) {
                // Se for habbohub, usar dados reais
        if (username.toLowerCase() === 'habbohub') {
                    // Usar dados reais do habbohub
          const realHabboInfo: HabboData = {
            id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
            habbo_name: 'habbohub',
            habbo_id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
            hotel: 'br',
            motto: 'HUB-QQ797',
            figure_string: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
            is_online: false,
            memberSince: '2024-01-01T00:00:00.000Z'
          };
          
          setHabboData(realHabboInfo);
          
          // Definir como proprietário se o usuário logado for habbohub
          const currentUserHabboName = habboAccount?.habbo_username?.split('-').pop()?.toLowerCase();
          const currentUserIsOwner = currentUserHabboName === username.toLowerCase();
          setIsOwner(currentUserIsOwner);
          
                    return;
          
          // Criar widgets padrão fictícios para habbohub
          const defaultWidgets: Widget[] = [
            {
              id: 'profile-habbohub',
              widget_type: 'profile',
              x: 20,
              y: 20,
              z_index: 1,
              width: 350,
              height: 180,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'guestbook-habbohub',
              widget_type: 'guestbook',
              x: 50,
              y: 220,
              z_index: 1,
              width: 350,
              height: 400,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'rating-habbohub',
              widget_type: 'rating',
              x: 500,
              y: 220,
              z_index: 1,
              width: 320,
              height: 160,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'info-habbohub',
              widget_type: 'info',
              x: 50,
              y: 620,
              z_index: 1,
              width: 770,
              height: 120,
              is_visible: true,
              config: {
                title: 'HabboHub - Sistema de Gestão',
                content: 'Bem-vindo ao painel administrativo do HabboHub! Aqui você pode gerenciar todas as funcionalidades do sistema.'
              }
            }
          ];
          
          setWidgets(defaultWidgets);
          setBackground({ background_type: 'image', background_value: '/assets/bghabbohub.png' });
          setGuestbook([
            {
              id: 'welcome-habbohub',
              home_owner_user_id: basicHabboInfo.id,
              author_habbo_name: 'Sistema',
              message: 'Bem-vindo à conta especial do sistema! 🏠✨',
              moderation_status: 'approved',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              author_look: '',
              author_hotel: 'br'
            },
            {
              id: 'admin-habbohub',
              home_owner_user_id: basicHabboInfo.id,
              author_habbo_name: 'Admin',
              message: 'Esta é a conta administrativa do HabboHub. Use com responsabilidade! 👨‍💼',
              moderation_status: 'approved',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              author_look: '',
              author_hotel: 'br'
            },
            {
              id: 'features-habbohub',
              home_owner_user_id: basicHabboInfo.id,
              author_habbo_name: 'Dev',
              message: 'Funcionalidades disponíveis: Editor de Avatar, Handitems, Badges, Console e muito mais! 🛠️',
              moderation_status: 'approved',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              updated_at: new Date(Date.now() - 172800000).toISOString(),
              author_look: '',
              author_hotel: 'br'
            }
          ]);
          
          // Salvar dados iniciais no localStorage
          const storageKey = `habbohub_home_${basicHabboInfo.habbo_name.toLowerCase()}`;
          const initialData = {
            widgets: defaultWidgets,
            stickers: [],
            background: { background_type: 'image', background_value: '/assets/bghabbohub.png' },
            guestbook: [
              {
                id: 'welcome-habbohub',
                home_owner_user_id: basicHabboInfo.id,
                author_habbo_name: 'Sistema',
                message: 'Bem-vindo à conta especial do sistema! 🏠✨',
                moderation_status: 'approved',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                author_look: '',
                author_hotel: 'br'
              },
              {
                id: 'admin-habbohub',
                home_owner_user_id: basicHabboInfo.id,
                author_habbo_name: 'Admin',
                message: 'Esta é a conta administrativa do HabboHub. Use com responsabilidade! 👨‍💼',
                moderation_status: 'approved',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                author_look: '',
                author_hotel: 'br'
              },
              {
                id: 'features-habbohub',
                home_owner_user_id: basicHabboInfo.id,
                author_habbo_name: 'Dev',
                message: 'Funcionalidades disponíveis: Editor de Avatar, Handitems, Badges, Console e muito mais! 🛠️',
                moderation_status: 'approved',
                created_at: new Date(Date.now() - 172800000).toISOString(),
                updated_at: new Date(Date.now() - 172800000).toISOString(),
                author_look: '',
                author_hotel: 'br'
              }
            ],
            lastSaved: new Date().toISOString()
          };
          localStorage.setItem(storageKey, JSON.stringify(initialData));
          
                    setLoading(false);
          return;
        }
        
        // Configuração especial para beebop
        if (username.toLowerCase() === 'beebop') {
                    const basicHabboInfo: HabboData = {
            id: 'hhbr-beebop-user-id-67890',
            habbo_name: 'beebop',
            habbo_id: 'hhbr-beebop-user-id-67890',
            hotel: 'br',
            motto: 'Desenvolvedor e Designer do HabboHub',
            figure_string: 'hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61',
            is_online: true,
            memberSince: '2024-01-15'
          };
          
          setHabboData(basicHabboInfo);
          
          // Definir como proprietário se o usuário logado for beebop
          const currentUserHabboName = habboAccount?.habbo_username?.split('-').pop()?.toLowerCase();
          const currentUserIsOwner = currentUserHabboName === username.toLowerCase();
          console.log('🔍 [DEBUG] Verificação de proprietário (beebop):', { 
            currentUser: habboAccount?.habbo_username, 
            targetUsername: username,
            isOwner: currentUserIsOwner
          });
          setIsOwner(currentUserIsOwner);
          
          // Criar widgets padrão fictícios para beebop
          const defaultWidgets: Widget[] = [
            {
              id: 'avatar-beebop',
              widget_type: 'avatar',
              x: 20,
              y: 20,
              z_index: 1,
              width: 200,
              height: 200,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'info-beebop',
              widget_type: 'info',
              x: 50,
              y: 620,
              z_index: 1,
              width: 400,
              height: 100,
              is_visible: true,
              config: {
                title: 'Beebop - Developer',
                content: 'Desenvolvedor e designer do HabboHub. Especialista em React, TypeScript e design de interfaces.'
              }
            },
            {
              id: 'guestbook-beebop',
              widget_type: 'guestbook',
              x: 50,
              y: 220,
              z_index: 1,
              width: 400,
              height: 200,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'rating-beebop',
              widget_type: 'rating',
              x: 500,
              y: 220,
              z_index: 1,
              width: 200,
              height: 100,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            }
          ];
          
          setWidgets(defaultWidgets);
          setBackground({ background_type: 'color', background_value: '#e6f3ff' });
          setGuestbook([
            {
              id: 'welcome-beebop',
              home_owner_user_id: 'hhbr-beebop-user-id-67890',
              author_habbo_name: 'Sistema',
              message: 'Bem-vindo à home do desenvolvedor! 🚀💻',
              moderation_status: 'approved',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              author_look: '',
              author_hotel: 'br'
            },
            {
              id: 'dev-beebop',
              home_owner_user_id: 'hhbr-beebop-user-id-67890',
              author_habbo_name: 'Dev Team',
              message: 'Ótimo trabalho no desenvolvimento do HabboHub! 👨‍💻✨',
              moderation_status: 'approved',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              author_look: '',
              author_hotel: 'br'
            }
          ]);
          
                    setLoading(false);
          return;
        }
        
        // Para outros usuários, usar dados básicos
        const basicHabboInfo: HabboData = {
          id: `local-${username.toLowerCase()}`,
          habbo_name: username,
          habbo_id: `local-${username.toLowerCase()}`,
          hotel: 'br',
          motto: 'Usuário local',
          figure_string: 'hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61',
          is_online: false,
          memberSince: ''
        };
        
        setHabboData(basicHabboInfo);
        
        // Definir como proprietário
        const currentUserIsOwner = habboAccount?.habbo_username?.toLowerCase() === username.toLowerCase();
        console.log('🔍 [DEBUG] Verificação de proprietário (fallback):', { 
          currentUser: habboAccount?.habbo_username, 
          targetUser: username,
          isOwner: currentUserIsOwner,
          habboAccount: habboAccount
        });
        setIsOwner(currentUserIsOwner);
        
        // Criar widgets padrão vazios, mas garantir que há um card de perfil
        const emptyWidgets = ensureProfileCard([], basicHabboInfo.id);
        setWidgets(emptyWidgets);
        setStickers([]);
        setBackground({ background_type: 'color', background_value: '#c7d2dc' });
        setGuestbook([]);
        
                setLoading(false);
        return;
      }

      // 1. Carregar dados do usuário Habbo
      const { data: userData, error: userError } = await supabase
        .from('habbo_auth')
        .select('*')
        .eq('habbo_username', username)
        .single();

      if (userError || !userData) {
                        // Para usuários especiais como habbohub que existem apenas no localStorage
        if (username.toLowerCase() === 'habbohub') {
          console.log('ℹ️ [useHabboHomeV2] habbohub é um usuário especial (simulação)');
          
          // Criar dados básicos fictícios
          const basicHabboInfo: HabboData = {
            id: 'hhbr-habbohub-user-id-12345', // ID fictício
            habbo_name: 'habbohub',
            habbo_id: 'hhbr-habbohub-system',
            hotel: 'br',
            motto: 'Sistema HabboHub - Administrador',
            figure_string: 'hd-180-1.ch-255-66.lg-285-80.sh-290-62.ha-1012-110.hr-831-49',
            is_online: false,
            memberSince: '2024'
          };
          
          setHabboData(basicHabboInfo);
          
          // Definir como proprietário se o usuário logado for habbohub
          const currentUserHabboName = habboAccount?.habbo_username?.split('-').pop()?.toLowerCase();
          const currentUserIsOwner = currentUserHabboName === username.toLowerCase();
          console.log('🔍 [DEBUG] Verificação de proprietário (hubbohub):', { 
            currentUser: habboAccount?.habbo_username, 
            targetUser: username,
            isOwner: currentUserIsOwner,
            habboAccount: habboAccount
          });
          setIsOwner(currentUserIsOwner);
          
          // Criar widgets padrão fictícios para habbohub
          const defaultWidgets: Widget[] = [
            {
              id: 'profile-habbohub',
              widget_type: 'profile',
              x: 20,
              y: 20,
              z_index: 1,
              width: 350,
              height: 180,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'guestbook-habbohub',
              widget_type: 'guestbook',
              x: 50,
              y: 220,
              z_index: 1,
              width: 350,
              height: 400,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'rating-habbohub',
              widget_type: 'rating',
              x: 500,
              y: 220,
              z_index: 1,
              width: 320,
              height: 160,
              is_visible: true,
              config: {
                profileSize: {
                  width: '350px',
                  height: '180px'
                }
              }
            },
            {
              id: 'info-habbohub',
              widget_type: 'info',
              x: 50,
              y: 620,
              z_index: 1,
              width: 770,
              height: 120,
              is_visible: true,
              config: {
                title: 'HabboHub - Sistema de Gestão',
                content: 'Bem-vindo ao painel administrativo do HabboHub! Aqui você pode gerenciar todas as funcionalidades do sistema.'
              }
            }
          ];
          
          setWidgets(defaultWidgets);
          setBackground({ background_type: 'image', background_value: '/assets/bghabbohub.png' });
          setGuestbook([
            {
              id: 'welcome-habbohub',
              home_owner_user_id: basicHabboInfo.id,
              author_habbo_name: 'Sistema',
              message: 'Bem-vindo à conta especial do sistema! 🏠✨',
              moderation_status: 'approved',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              author_look: '',
              author_hotel: 'br'
            },
            {
              id: 'admin-habbohub',
              home_owner_user_id: basicHabboInfo.id,
              author_habbo_name: 'Admin',
              message: 'Esta é a conta administrativa do HabboHub. Use com responsabilidade! 👨‍💼',
              moderation_status: 'approved',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              author_look: '',
              author_hotel: 'br'
            },
            {
              id: 'features-habbohub',
              home_owner_user_id: basicHabboInfo.id,
              author_habbo_name: 'Dev',
              message: 'Funcionalidades disponíveis: Editor de Avatar, Handitems, Badges, Console e muito mais! 🛠️',
              moderation_status: 'approved',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              updated_at: new Date(Date.now() - 172800000).toISOString(),
              author_look: '',
              author_hotel: 'br'
            }
          ]);
          
                    setLoading(false);
          return;
        }
        
        // Fallback: Se o usuário não foi encontrado no banco, mas é o usuário logado
        if (habboAccount && habboAccount.habbo_name.toLowerCase() === username.toLowerCase()) {
                    // Criar dados básicos do usuário logado
          const basicHabboInfo: HabboData = {
            id: habboAccount.supabase_user_id,
            habbo_name: habboAccount.habbo_name,
            habbo_id: habboAccount.habbo_id,
            hotel: habboAccount.hotel || 'br',
            motto: habboAccount.motto || '',
            figure_string: habboAccount.figure_string || '',
            is_online: habboAccount.is_online || false,
            memberSince: ''
          };
          
          setHabboData(basicHabboInfo);
          
          // Definir como proprietário
          const currentUserHabboName = habboAccount?.habbo_username?.split('-').pop()?.toLowerCase();
          const currentUserIsOwner = currentUserHabboName === username.toLowerCase();
          console.log('🔍 [DEBUG] Verificação de proprietário (fallback):', { 
            currentUser: habboAccount?.habbo_username, 
            targetUser: username,
            isOwner: currentUserIsOwner,
            habboAccount: habboAccount
          });
          setIsOwner(currentUserIsOwner);
          
          // Criar widgets padrão vazios, mas garantir que há um card de perfil
          const emptyWidgets = ensureProfileCard([], basicHabboInfo.id);
          setWidgets(emptyWidgets);
          setStickers([]);
          setBackground({
            background_type: 'color',
            background_value: '#87CEEB'
          });
          setGuestbook([]);
          
                    setLoading(false);
          return;
        }
        
        setHabboData(null);
        setLoading(false);
        return;
      }

            // Criar dados básicos primeiro (sem API externa)
      const basicHabboInfo: HabboData = {
        id: userData.id.startsWith('hhbr-') ? userData.id : `hhbr-${userData.habbo_username}-user-id-${userData.id.slice(-5)}`,
        habbo_name: userData.habbo_username,
        habbo_id: userData.id.startsWith('hhbr-') ? userData.id : `hhbr-${userData.habbo_username}-user-id-${userData.id.slice(-5)}`,
        hotel: 'br', // Padrão para BR
        motto: userData.habbo_motto || '',
        figure_string: userData.habbo_avatar || '',
        is_online: false, // Padrão
        memberSince: ''
      };

      setHabboData(basicHabboInfo);

      // 2. Verificar proprietário (considerando domínio)
      const currentUserIsOwner = habboAccount?.habbo_username?.toLowerCase() === username.toLowerCase() ||
                                 (habboAccount?.habbo_username?.toLowerCase().includes('habbohub') && username.toLowerCase() === 'habbohub');
      setIsOwner(currentUserIsOwner);
      console.log('🔍 [DEBUG] Verificação de proprietário (real):', { 
        currentUserIsOwner,
        currentUser: habboAccount?.habbo_username, 
        targetUser: username,
        habboAccount: habboAccount,
        isLoggedIn: !!habboAccount,
        localStorageSession: localStorage.getItem('habbohub_session')
      });
            const userId = basicHabboInfo.id; // Usar o ID fictício em vez do Supabase ID

      // 3. Carregar dados da home em paralelo (sem bloquear com API externa)
            // Para usuários fictícios (habbohub, beebop), usar dados locais
      if (username.toLowerCase() === 'habbohub' || username.toLowerCase() === 'beebop') {
                // Usar dados fictícios já configurados
        setLoading(false);
        return;
      }
      
      const [
        { data: newWidgets },
        { data: stickersData },
        { data: bgData },
        { data: guestbookData }
      ] = await Promise.all([
        // Widgets - carregar todos, incluindo os ocultos
        supabase
          .from('user_home_widgets')
          .select('*')
          .eq('user_id', userId),
        
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

      // Processar widgets - filtrar apenas os visíveis para exibição
      let widgetsData: Widget[] = [];
      if (newWidgets && newWidgets.length > 0) {
        // Filtrar apenas widgets visíveis para exibição
        const visibleWidgets = newWidgets.filter(widget => widget.is_visible);
        widgetsData = visibleWidgets.map(widget => ({
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
        
        // Log de widgets ocultos para debug
        const hiddenWidgets = newWidgets.filter(widget => !widget.is_visible);
        if (hiddenWidgets.length > 0) {
          console.log('🙈 Widgets ocultos encontrados:', hiddenWidgets.map(w => ({ 
            id: w.id, 
            type: w.widget_type, 
            visible: w.is_visible 
          })));
        }
      }

            console.log('🔍 Widgets por tipo:', widgetsData.reduce((acc, widget) => {
        acc[widget.widget_type] = (acc[widget.widget_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      // Garantir que existe um widget avatar e está centralizado (só para o proprietário)
      const avatarWidget = widgetsData.find(w => w.widget_type === 'avatar');
      if (currentUserIsOwner && !avatarWidget) {
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
                setStickers(formattedStickers);
      }

      // Processar background
      if (bgData) {
        setBackground({
          background_type: bgData.background_type as 'color' | 'cover' | 'repeat' | 'image',
          background_value: bgData.background_value
        });
              }

      // Processar guestbook
      if (guestbookData) {
        setGuestbook(guestbookData);
              }

            // Garantir que sempre há um card de perfil
      if (habboData && widgets.length > 0) {
        const widgetsWithProfile = ensureProfileCard(widgets, habboData.id);
        if (widgetsWithProfile.length !== widgets.length) {
          setWidgets(widgetsWithProfile);
                  }
      }
      
      setLoading(false);

      // 4. Carregar perfil do Habbo em background (não-bloqueante)
      loadHabboProfile(userData, basicHabboInfo);
    } catch (error) {
            setLoading(false);
    }
  };

  // Função de salvamento automático com debounce
  const saveChanges = useCallback(async () => {
    if (!isOwner || !habboData) return;
    
    const changes = pendingChangesRef.current;
    if (!changes.widgets && !changes.stickers && !changes.background && !changes.guestbook) return;

    setIsSaving(true);
    try {
            // Para usuários fictícios (habbohub, beebop), salvar no localStorage
      if (habboData.id.startsWith('hhbr-')) {
                const storageKey = `habbohub_home_${habboData.habbo_name.toLowerCase()}`;
        
        // Preparar dados para persistência
        const homeData = {
          widgets: changes.widgets || widgets,
          stickers: changes.stickers || stickers,
          background: changes.background || background,
          guestbook: changes.guestbook || guestbook,
          lastSaved: new Date().toISOString()
        };
        
        // Salvar no localStorage
                        localStorage.setItem(storageKey, JSON.stringify(homeData));
        
        // Verificar se foi salvo corretamente
        const savedData = localStorage.getItem(storageKey);
                setLastSaved(new Date());
        pendingChangesRef.current = {};
                return;
      }

      // Para usuários reais, salvar no Supabase
      if (!supabase) {
                return;
      }

      // Salvar widgets se houver mudanças
      if (changes.widgets) {
        for (const widget of changes.widgets) {
                    const { error } = await supabase
            .from('user_home_widgets')
            .update({ x: widget.x, y: widget.y })
            .eq('id', widget.id);
          
          if (error) {
                      }
        }
      }

      // Salvar stickers se houver mudanças
      if (changes.stickers) {
        for (const sticker of changes.stickers) {
          await supabase
            .from('user_stickers')
            .update({ x: sticker.x, y: sticker.y })
            .eq('id', sticker.id);
        }
      }

      // Salvar background se houver mudanças
      if (changes.background) {
        await supabase
          .from('user_home_backgrounds')
          .upsert({
            user_id: habboData.id,
            background_type: changes.background.background_type,
            background_value: changes.background.background_value
          });
      }

      setLastSaved(new Date());
      pendingChangesRef.current = {};
      
      // Invalidar a lista de homes para atualizar a lista de recentemente editadas
      queryClient.invalidateQueries({ queryKey: ['latest-homes'] });
      
          } catch (error) {
          } finally {
      setIsSaving(false);
    }
  }, [isOwner, habboData, widgets, stickers, background, guestbook, supabase]);

  // Função para agendar salvamento com debounce
  const scheduleSave = useCallback(() => {
  // Agendando salvamento automático
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges();
    }, 2000); // Salvar após 2 segundos de inatividade
  }, [saveChanges, isOwner, habboData]);

  const updateWidgetPosition = useCallback(async (widgetId: string, x: number, y: number) => {
        if (!isOwner || !habboData) {
            return;
    }

    try {
      // Atualizar estado local imediatamente
      setWidgets(prev => {
        const updated = prev.map(widget => 
          widget.id === widgetId ? { ...widget, x, y } : widget
        );
        
                // Adicionar às mudanças pendentes
        pendingChangesRef.current.widgets = updated;
                scheduleSave();
        
        return updated;
      });

      console.log(`✅ Widget ${widgetId} movido para (${x}, ${y})`);
    } catch (error) {
          }
  }, [isOwner, habboData, scheduleSave, widgets.length]);

  const updateStickerPosition = useCallback(async (stickerId: string, x: number, y: number) => {
        if (!isOwner || !habboData) {
            return;
    }

    try {
      // Atualizar estado local imediatamente
      setStickers(prev => {
        const updated = prev.map(sticker => 
          sticker.id === stickerId ? { ...sticker, x, y } : sticker
        );
        
                // Adicionar às mudanças pendentes
        pendingChangesRef.current.stickers = updated;
                scheduleSave();
        
        return updated;
      });

      console.log(`✅ Sticker ${stickerId} movido para (${x}, ${y})`);
    } catch (error) {
          }
  }, [isOwner, habboData, scheduleSave, stickers.length]);

  const addSticker = async (stickerId: string, x: number, y: number, stickerSrc: string, category: string) => {
    if (!isOwner || !habboData) {
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
      
      // Posicionar no canto superior esquerdo (20px x 20px)
      const centerX = 20;
      const centerY = 20;
      
      // Para usuários fictícios, apenas atualizar estado local
      if (habboData.id.startsWith('hhbr-')) {
                const newSticker: Sticker = {
          id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sticker_id: stickerId,
          x: centerX,
          y: centerY,
          z_index: nextZ,
          scale: 1.0,
          rotation: 0,
          sticker_src: stickerSrc,
          category: category || 'outros'
        };
        
        const updatedStickers = [...stickers, newSticker];
        setStickers(updatedStickers);
        
        // Adicionar às mudanças pendentes
        pendingChangesRef.current.stickers = updatedStickers;
        scheduleSave();
        
                return true;
      }
      
      if (!supabase) {
                return false;
      }
      
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

            const { data, error } = await supabase
        .from('user_stickers')
        .insert(payload)
        .select()
        .single();

      if (error) {
                return false;
      }

      if (!data) {
                return false;
      }

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
      
            // Update local state
      setStickers(prev => {
        const updated = [...prev, newSticker];
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
      
            return true;
      
    } catch (error) {
            return false;
    }
  };

  const removeSticker = async (stickerId: string) => {
    if (!isOwner || !habboData) return;

    try {
      // Para usuários fictícios, apenas atualizar estado local
      if (habboData.id.startsWith('hhbr-')) {
        const updatedStickers = stickers.filter(sticker => sticker.id !== stickerId);
        setStickers(updatedStickers);
        
        // Adicionar às mudanças pendentes
        pendingChangesRef.current.stickers = updatedStickers;
        scheduleSave();
        
                return;
      }

      await supabase
        .from('user_stickers')
        .delete()
        .eq('id', stickerId)
        .eq('user_id', habboData.id);

      const updatedStickers = stickers.filter(sticker => sticker.id !== stickerId);
      setStickers(updatedStickers);
      
      // Adicionar às mudanças pendentes
      pendingChangesRef.current.stickers = updatedStickers;
      scheduleSave();
    } catch (error) {
          }
  };

  const addWidget = async (widgetType: string): Promise<boolean> => {
    if (!isOwner || !habboData) {
            return false;
    }

    // Check if widget already exists in local state
        console.log(`📋 Widgets atuais:`, widgets.map(w => ({ id: w.id, type: w.widget_type, visible: w.is_visible })));
    
    const existingWidget = widgets.find(w => w.widget_type === widgetType);
    if (existingWidget) {
            // Mover widget existente para o canto superior esquerdo (50, 50)
      const newX = 50;
      const newY = 50;
      
      // Para usuários fictícios, apenas atualizar estado local
      if (habboData.id.startsWith('hhbr-')) {
                const updatedWidgets = widgets.map(widget => 
          widget.id === existingWidget.id 
            ? { ...widget, x: newX, y: newY, is_visible: true }
            : widget
        );
        setWidgets(updatedWidgets);
        
        // Adicionar às mudanças pendentes
        pendingChangesRef.current.widgets = updatedWidgets;
        scheduleSave();
        
        console.log(`✅ Widget ${widgetType} movido para posição (${newX}, ${newY})`);
        return true;
      }
      
      try {
        if (!supabase) {
                    return false;
        }
        
        // Atualizar posição no banco de dados
        const { error } = await supabase
          .from('user_home_widgets')
          .update({ 
            x: newX, 
            y: newY,
            is_visible: true, // Garantir que está visível
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWidget.id)
          .eq('user_id', habboData.id);

        if (error) {
                    return false;
        }

        // Atualizar estado local
        setWidgets(prev => 
          prev.map(widget => 
            widget.id === existingWidget.id 
              ? { ...widget, x: newX, y: newY, is_visible: true }
              : widget
          )
        );

        console.log(`✅ Widget ${widgetType} movido para posição (${newX}, ${newY})`);
        return true;
      } catch (error) {
                return false;
      }
    }

    // Para usuários fictícios, criar widget localmente
    if (habboData.id.startsWith('hhbr-')) {
            const newWidget: Widget = {
        id: `widget-${widgetType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        widget_type: widgetType,
        x: 50,
        y: 50,
        z_index: Math.max(0, ...widgets.map(w => w.z_index || 0)) + 1,
        width: 200,
        height: 100,
        is_visible: true,
        config: {}
      };
      
      setWidgets(prev => [...prev, newWidget]);
            return true;
    }

    // Verificar se há widget oculto no banco de dados
    try {
      if (!supabase) {
                return false;
      }
      
            const { data: hiddenWidget, error: hiddenError } = await supabase
        .from('user_home_widgets')
        .select('*')
        .eq('user_id', habboData.id)
        .eq('widget_type', widgetType)
        .eq('is_visible', false)
        .single();

      if (!hiddenError && hiddenWidget) {
                const newX = 50;
        const newY = 50;
        
        // Reativar widget oculto
        await supabase
          .from('user_home_widgets')
          .update({ 
            x: newX, 
            y: newY,
            is_visible: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', hiddenWidget.id)
          .eq('user_id', habboData.id);

        // Adicionar ao estado local
        const reactivatedWidget: Widget = {
          id: hiddenWidget.id,
          widget_type: hiddenWidget.widget_type,
          x: newX,
          y: newY,
          z_index: hiddenWidget.z_index,
          width: hiddenWidget.width,
          height: hiddenWidget.height,
          is_visible: true,
          config: hiddenWidget.config
        };

        setWidgets(prev => [...prev, reactivatedWidget]);
        console.log(`✅ Widget ${widgetType} reativado e movido para posição (${newX}, ${newY})`);
        return true;
      }
    } catch (error) {
          }

    try {
            const x = Math.random() * (1080 - 300) + 50;
      const y = Math.random() * (1800 - 200) + 50;
      const nextZ = Math.max(0, ...widgets.map(w => w.z_index || 0), ...stickers.map(s => s.z_index || 0)) + 1;
      
      const payload = {
        user_id: habboData.id,
        widget_type: widgetType,
        x: Math.round(x),
        y: Math.round(y),
        z_index: nextZ,
        width: widgetType === 'guestbook' ? 350 : 320,
        height: widgetType === 'guestbook' ? 400 : 160,
        is_visible: true,
        config: {}
      };

            const { data, error } = await supabase
        .from('user_home_widgets')
        .insert(payload)
        .select()
        .single();

      if (error) {
                return false;
      }

      if (!data) {
                return false;
      }

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
                return updated;
      });
      
            return true;
    } catch (error) {
            return false;
    }
  };

  const removeWidget = async (widgetId: string) => {
    if (!isOwner || !habboData) return;

    try {
            // Find the widget to check its type
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) {
                return;
      }

      // Para usuários fictícios, apenas atualizar estado local
      if (habboData.id.startsWith('hhbr-')) {
        const updatedWidgets = widgets.filter(w => w.id !== widgetId);
        setWidgets(updatedWidgets);
        
        // Adicionar às mudanças pendentes
        pendingChangesRef.current.widgets = updatedWidgets;
        scheduleSave();
        
                return;
      }

      if (!supabase) {
                return;
      }

      // Remove widget completely from database
      const { error } = await supabase
        .from('user_home_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', habboData.id);

      if (error) {
                return;
      }

      // Update local state
      const updatedWidgets = widgets.filter(widget => widget.id !== widgetId);
      setWidgets(updatedWidgets);
      
      // Adicionar às mudanças pendentes
      pendingChangesRef.current.widgets = updatedWidgets;
      scheduleSave();
      
          } catch (error) {
          }
  };

  const updateBackground = async (bgType: 'color' | 'cover' | 'repeat' | 'image', bgValue: string) => {
    if (!isOwner || !habboData) {
            return;
    }

    try {
            // Para usuários fictícios, apenas atualizar estado local
      if (habboData.id.startsWith('hhbr-')) {
                const newBackground = {
          background_type: bgType,
          background_value: bgValue
        };
        setBackground(newBackground);
        
        // Adicionar às mudanças pendentes para salvamento automático
        pendingChangesRef.current.background = newBackground;
        scheduleSave();
        
                return;
      }

      if (!supabase) {
                return;
      }
      
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
                return;
      }

            // Atualizar estado local
      const newBackground = {
        background_type: bgType,
        background_value: bgValue
      };
      
      setBackground(newBackground);
      
          } catch (error) {
          }
  };

  useEffect(() => {
    if (username) {
      loadHabboHomeData();
    }
  }, [username, habboAccount]);

  // Função para enviar mensagem no guestbook
  const submitGuestbookMessage = async (message: string) => {
    if (!habboAccount || !habboData) {
      throw new Error('Usuário não autenticado ou dados da home não carregados');
    }

    try {
      // Para usuários fictícios, criar entrada local
      if (habboData.id.startsWith('hhbr-')) {
                const newEntry = {
          id: `guestbook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          home_owner_user_id: habboData.id,
          author_user_id: habboAccount.id,
          author_habbo_name: habboAccount.habbo_username,
          message: message.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          moderation_status: 'approved',
          author_look: '',
          author_hotel: 'br'
        };
        
        // Atualizar estado local
        const updatedGuestbook = [newEntry, ...guestbook];
        setGuestbook(updatedGuestbook);
        
        // Adicionar às mudanças pendentes
        pendingChangesRef.current.guestbook = updatedGuestbook;
        scheduleSave();
        
                return newEntry;
      }

      // Para usuários reais, inserir no Supabase
      const { data, error } = await supabase
        .from('guestbook_entries')
        .insert({
          home_owner_user_id: habboData.id,
          author_user_id: habboAccount.id,
          author_habbo_name: habboAccount.habbo_username,
          message: message.trim(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
                throw error;
      }

      // Atualizar estado local
      setGuestbook(prev => [data, ...prev]);
            return data;
    } catch (error) {
            throw error;
    }
  };

  // Função para deletar mensagem do guestbook
  const deleteGuestbookMessage = async (entryId: string) => {
        if (!habboAccount) {
            throw new Error('Usuário não autenticado');
    }

    try {
      // Para usuários fictícios, deletar localmente
      if (habboData?.id.startsWith('hhbr-')) {
                // Atualizar estado local
        const updatedGuestbook = guestbook.filter(entry => entry.id !== entryId);
        setGuestbook(updatedGuestbook);
        
        // Adicionar às mudanças pendentes
        pendingChangesRef.current.guestbook = updatedGuestbook;
        scheduleSave();
        
                return;
      }

            // Primeiro, vamos verificar se o comentário existe e suas permissões
      const { data: existingEntry, error: fetchError } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (fetchError) {
                throw fetchError;
      }

            // Tentar deletar via Supabase normal primeiro
      const { error } = await supabase
        .from('guestbook_entries')
        .delete()
        .eq('id', entryId);

            if (error) {
                        // Se houver erro, tentar via edge function como fallback
                try {
          const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/delete-guestbook-comments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`
            },
            body: JSON.stringify({
              home_owner_user_id: habboData?.id,
              entry_id: entryId // Adicionar ID específico para deletar
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
                        throw new Error(`Edge function falhou: ${errorData.error}`);
          }

          const result = await response.json();
                  } catch (edgeError) {
                    throw new Error('Falha ao deletar via edge function');
        }
      }

            // Atualizar estado local
      setGuestbook(prev => {
        const newGuestbook = prev.filter(entry => entry.id !== entryId);
                return newGuestbook;
      });
          } catch (error) {
            throw error;
    }
  };

  // Função para limpar todos os comentários do guestbook (para teste)
  const clearAllGuestbookEntries = async () => {
    if (!habboData) {
            return;
    }

    try {
            // Usar edge function para contornar políticas RLS
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/delete-guestbook-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          home_owner_user_id: habboData.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao limpar guestbook');
      }

      // Limpar estado local
      setGuestbook([]);
          } catch (error) {
          }
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
    isSaving,
    lastSaved,
    currentUser: habboAccount,
    setIsEditMode,
    updateWidgetPosition,
    updateStickerPosition,
    addSticker,
    removeSticker,
    updateBackground,
    addWidget,
    removeWidget,
    onGuestbookSubmit: submitGuestbookMessage,
    onGuestbookDelete: deleteGuestbookMessage,
    clearAllGuestbookEntries,
    reloadData: loadHabboHomeData,
    saveChanges,
    updateExistingGuestbooks: async () => {
      if (!habboData) return;
      try {
                await supabase
          .from('user_home_widgets')
          .update({ 
            width: 350, 
            height: 400,
            updated_at: new Date().toISOString()
          })
          .eq('widget_type', 'guestbook');
        
        setWidgets(prev => 
          prev.map(widget => 
            widget.widget_type === 'guestbook'
              ? { ...widget, width: 350, height: 400 }
              : widget
          )
        );
              } catch (error) {
              }
    }
  };
};

