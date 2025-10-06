import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealHabboData } from './useRealHabboData';
import { useDebouncedQuery } from './useDebouncedQuery';
import { habboCacheService } from '@/services/habboCacheService';

interface LatestHomeData {
  user_id: string;
  habbo_name?: string;
  hotel?: string;
  updated_at: string;
  background_type?: string;
  background_value?: string;
  average_rating?: number;
  ratings_count?: number;
}

export const useLatestHomes = () => {
  const queryClient = useQueryClient();
  const { realUsers } = useRealHabboData();
  
  // Função para buscar dados das homes
  const fetchLatestHomesData = async (): Promise<LatestHomeData[]> => {
    console.log('🔍 [useLatestHomes] Buscando dados das homes...');
    
    // Buscar mudanças em TODAS as tabelas relacionadas ao canvas
    const [
      { data: updatedLayouts, error: layoutError },
      { data: updatedBackgrounds, error: backgroundError },
      { data: updatedWidgets, error: widgetError },
      { data: updatedStickers, error: stickerError }
    ] = await Promise.all([
      // Layouts (widgets principais)
      supabase
        .from('user_home_layouts')
        .select('user_id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(100),
      
      // Backgrounds
      supabase
        .from('user_home_backgrounds')
        .select('user_id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(100),
      
      // Widgets
      supabase
        .from('user_home_widgets')
        .select('user_id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(100),
      
      // Stickers
      supabase
        .from('user_stickers')
        .select('user_id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(100)
    ]);

    // Verificar erros
    if (layoutError) console.warn('Erro ao buscar layouts:', layoutError);
    if (backgroundError) console.warn('Erro ao buscar backgrounds:', backgroundError);
    if (widgetError) console.warn('Erro ao buscar widgets:', widgetError);
    if (stickerError) console.warn('Erro ao buscar stickers:', stickerError);

    // Combinar todas as mudanças
    const allChanges = [
      ...(updatedLayouts || []),
      ...(updatedBackgrounds || []),
      ...(updatedWidgets || []),
      ...(updatedStickers || [])
    ];

    // Agrupar por user_id e pegar a mudança mais recente
    const latestChanges = allChanges.reduce((acc, change) => {
      const userId = change.user_id;
      const existing = acc[userId];
      
      if (!existing || new Date(change.updated_at) > new Date(existing.updated_at)) {
        acc[userId] = change;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Converter para array e ordenar por updated_at
    const latestUniqueHomes = Object.values(latestChanges)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 20); // Limitar a 20 homes

    // Buscar dados adicionais para enriquecer
    const userIds = latestUniqueHomes.map(home => home.user_id);
    
    if (userIds.length === 0) {
      console.log('📭 Nenhuma home encontrada');
      return [];
    }

    // Buscar contas dos usuários
    const { data: accounts, error: accountsError } = await supabase
      .from('habbo_accounts')
      .select('supabase_user_id, habbo_name, hotel')
      .in('supabase_user_id', userIds);

    if (accountsError) {
      console.warn('Erro ao buscar contas:', accountsError);
    }

    // Buscar backgrounds
    const { data: backgrounds, error: backgroundsError } = await supabase
      .from('user_home_backgrounds')
      .select('user_id, background_type, background_value')
      .in('user_id', userIds);

    if (backgroundsError) {
      console.warn('Erro ao buscar backgrounds:', backgroundsError);
    }

    // Buscar avaliações
    const { data: ratings, error: ratingsError } = await supabase
      .from('user_home_ratings')
      .select('home_owner_user_id, rating')
      .in('home_owner_user_id', userIds);

    if (ratingsError) {
      console.warn('Erro ao buscar avaliações:', ratingsError);
    }

    // Combinar os dados
    const enrichedHomes = latestUniqueHomes.map(home => {
      const account = accounts?.find(acc => acc.supabase_user_id === home.user_id);
      const background = backgrounds?.find(bg => bg.user_id === home.user_id);
      
      // Calcular avaliação média
      const homeRatings = ratings?.filter(r => r.home_owner_user_id === home.user_id) || [];
      const averageRating = homeRatings.length > 0 
        ? homeRatings.reduce((sum, r) => sum + r.rating, 0) / homeRatings.length 
        : 0;
      
      return {
        ...home,
        habbo_name: account?.habbo_name,
        hotel: account?.hotel,
        background_type: background?.background_type,
        background_value: background?.background_value,
        average_rating: Math.round(averageRating * 10) / 10,
        ratings_count: homeRatings.length
      };
    });

    // Filtrar apenas homes de usuários cadastrados na tabela habbo_accounts
    const registeredUserIds = accounts?.map(acc => acc.supabase_user_id) || [];
    const filteredHomes = enrichedHomes.filter(home => 
      registeredUserIds.includes(home.user_id)
    );
    
    // Ordenar por updated_at (mais recentes primeiro)
    return filteredHomes.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  };
  
  // Hook de debounce para consultas
  const { data: debouncedData, loading: debouncedLoading, error: debouncedError } = useDebouncedQuery(
    fetchLatestHomesData,
    { delay: 300, maxWait: 2000 }
  );

  const invalidateLatestHomes = () => {
    console.log('🔄 [useLatestHomes] Invalidando cache...');
    queryClient.invalidateQueries({ queryKey: ['latest-homes'] });
  };

  const forceRefreshLatestHomes = async () => {
    console.log('🔄 [useLatestHomes] Forçando refresh...');
    await queryClient.invalidateQueries({ queryKey: ['latest-homes'] });
    await queryClient.refetchQueries({ queryKey: ['latest-homes'] });
  };

  // Query principal com configurações OTIMIZADAS para detecção rápida
  const query = useQuery({
    queryKey: ['latest-homes-optimized'],
    queryFn: fetchLatestHomesData,
    staleTime: 0, // Sempre considerar dados como stale para detectar mudanças imediatamente
    gcTime: 5 * 60 * 1000,   // 5 minutos
    refetchInterval: 3 * 1000, // 3 segundos para detectar mudanças rapidamente
    refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
    refetchOnMount: true,
    retry: 2, // Máximo 2 tentativas
    retryDelay: 1000, // 1 segundo entre tentativas
  });

  // Query de fallback (manter compatibilidade)
  const fallbackQuery = useQuery({
    queryKey: ['latest-homes'],
    queryFn: async (): Promise<LatestHomeData[]> => {
      // Buscar mudanças em TODAS as tabelas relacionadas ao canvas
      const [
        { data: updatedLayouts, error: layoutError },
        { data: updatedBackgrounds, error: backgroundError },
        { data: updatedWidgets, error: widgetError },
        { data: updatedStickers, error: stickerError }
      ] = await Promise.all([
        // Layouts (widgets principais)
        supabase
          .from('user_home_layouts')
          .select('user_id, updated_at, created_at')
          .order('updated_at', { ascending: false })
          .limit(100),
        
        // Backgrounds
        supabase
          .from('user_home_backgrounds')
          .select('user_id, updated_at, created_at')
          .order('updated_at', { ascending: false })
          .limit(100),
        
        // Widgets individuais
        supabase
          .from('user_home_widgets')
          .select('user_id, updated_at, created_at')
          .order('updated_at', { ascending: false })
          .limit(100),
        
        // Stickers
        supabase
          .from('user_stickers')
          .select('user_id, updated_at, created_at')
          .order('updated_at', { ascending: false })
          .limit(100)
      ]);

      if (layoutError || backgroundError || widgetError || stickerError) {
        throw layoutError || backgroundError || widgetError || stickerError;
      }

      // Combinar todas as mudanças em um mapa único
      const uniqueUsers = new Map<string, LatestHomeData>();
      
      // Processar layouts
      updatedLayouts?.forEach(home => {
        const lastActivity = new Date(home.updated_at).getTime();
        const existing = uniqueUsers.get(home.user_id);
        if (!existing || new Date(existing.updated_at).getTime() < lastActivity) {
          uniqueUsers.set(home.user_id, {
            user_id: home.user_id,
            updated_at: home.updated_at
          });
        }
      });

      // Processar backgrounds
      updatedBackgrounds?.forEach(home => {
        const lastActivity = new Date(home.updated_at).getTime();
        const existing = uniqueUsers.get(home.user_id);
        if (!existing || new Date(existing.updated_at).getTime() < lastActivity) {
          uniqueUsers.set(home.user_id, {
            user_id: home.user_id,
            updated_at: home.updated_at
          });
        }
      });

      // Processar widgets individuais
      updatedWidgets?.forEach(widget => {
        const lastActivity = new Date(widget.updated_at).getTime();
        const existing = uniqueUsers.get(widget.user_id);
        if (!existing || new Date(existing.updated_at).getTime() < lastActivity) {
          uniqueUsers.set(widget.user_id, {
            user_id: widget.user_id,
            updated_at: widget.updated_at
          });
        }
      });

      // Processar stickers
      updatedStickers?.forEach(sticker => {
        const lastActivity = new Date(sticker.updated_at).getTime();
        const existing = uniqueUsers.get(sticker.user_id);
        if (!existing || new Date(existing.updated_at).getTime() < lastActivity) {
          uniqueUsers.set(sticker.user_id, {
            user_id: sticker.user_id,
            updated_at: sticker.updated_at
          });
        }
      });

      // Ordenar por data mais recente e pegar os top 20
      const latestUniqueHomes = Array.from(uniqueUsers.values())
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 20);

      // Buscar dados adicionais para esses usuários
      const userIds = latestUniqueHomes.map(home => home.user_id);
      
      // Buscar nomes das contas Habbo
      const { data: accounts } = await supabase
        .from('habbo_accounts')
        .select('supabase_user_id, habbo_name')
        .in('supabase_user_id', userIds);

      // Buscar dados de background
      const { data: backgrounds } = await supabase
        .from('user_home_backgrounds')
        .select('user_id, background_type, background_value')
        .in('user_id', userIds);

      // Buscar avaliações médias
      const { data: ratings } = await supabase
        .from('user_home_ratings')
        .select('home_owner_user_id, rating')
        .in('home_owner_user_id', userIds);

      // Combinar os dados
      const enrichedHomes = latestUniqueHomes.map(home => {
        const account = accounts?.find(acc => acc.supabase_user_id === home.user_id);
        const background = backgrounds?.find(bg => bg.user_id === home.user_id);
        
        // Calcular avaliação média
        const homeRatings = ratings?.filter(r => r.home_owner_user_id === home.user_id) || [];
        const averageRating = homeRatings.length > 0 
          ? homeRatings.reduce((sum, r) => sum + r.rating, 0) / homeRatings.length 
          : 0;
        
        return {
          ...home,
          habbo_name: account?.habbo_name,
          background_type: background?.background_type,
          background_value: background?.background_value,
          average_rating: Math.round(averageRating * 10) / 10,
          ratings_count: homeRatings.length
        };
      });

      // Filtrar apenas homes de usuários cadastrados na tabela habbo_accounts
      const registeredUserIds = accounts?.map(acc => acc.supabase_user_id) || [];
      const filteredHomes = enrichedHomes.filter(home => 
        registeredUserIds.includes(home.user_id)
      );
      
      // Ordenar por updated_at (mais recentes primeiro)
      return filteredHomes.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    },
    staleTime: 0, // Sempre considerar dados como stale para detectar mudanças imediatamente
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 3 * 1000, // 3 segundos para detectar mudanças rapidamente
    refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
    refetchOnMount: true, // Sempre refetch ao montar
  });

  // Usar query otimizada como principal, fallback como backup
  const finalQuery = query.data ? query : fallbackQuery;
  
  return {
    ...finalQuery,
    // Adicionar dados do debounce se disponíveis
    data: debouncedData || finalQuery.data,
    loading: debouncedLoading || finalQuery.isLoading,
    error: debouncedError || finalQuery.error,
    invalidateLatestHomes,
    forceRefreshLatestHomes,
    // Estatísticas do cache
    cacheStats: habboCacheService.getCacheStats()
  };
};