import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedPhoto } from '@/types/habbo';
import { formatHabboTimestamp } from '@/utils/timestampUtils';

export interface GlobalPhotoFeedData {
  photos: EnhancedPhoto[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
  cursor: string;
}

export interface UseGlobalPhotoFeedOptions {
  limit?: number;
  hotel?: string;
  enableCache?: boolean;
  cacheTime?: number; // em minutos
}

export const useGlobalPhotoFeed = (options: UseGlobalPhotoFeedOptions = {}) => {
  const {
    limit = 20,
    hotel = 'all',
    enableCache = true,
    cacheTime = 30 // Reduzido para 30 minutos para melhor performance
  } = options;

  const [cursor, setCursor] = useState<string | undefined>();
  const [allPhotos, setAllPhotos] = useState<EnhancedPhoto[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Resetar quando o hotel mudar
  useEffect(() => {
    setCursor(undefined);
    setAllPhotos([]);
    setIsLoadingMore(false);
  }, [hotel]);

  // Cache key baseado em timestamp
  const getCacheKey = useCallback(() => {
    const now = new Date();
    const cacheDate = new Date(now.getTime() - (cacheTime * 60 * 1000));
    return `global-feed-${hotel}-${cacheDate.toISOString().split('T')[0]}`;
  }, [hotel, cacheTime]);

  // Função para buscar fotos usando Supabase Function
  // O cursor agora representa página/offset na lista global (0 = primeira página, 1 = próxima, etc.)
  const fetchGlobalPhotos = useCallback(async (currentCursor?: string): Promise<GlobalPhotoFeedData> => {
    try {
      // Converter hotel para formato esperado (com.br -> br), exceto para 'all'
      const hotelCode = hotel === 'com.br' ? 'br' : hotel;

      // Usar função Supabase para buscar fotos globais do dia específico
      const { data, error } = await supabase.functions.invoke('habbo-global-feed', {
        body: {
          cursor: currentCursor, // cursor = dayOffset (0 = hoje, 1 = ontem, etc.)
          limit,
          hotel: hotelCode
        }
      });

      if (error) {
        console.error('[🌍 GLOBAL FEED] Supabase function error:', error);
        throw new Error(error.message || 'Failed to fetch global photos');
      }

      if (!data || data.error) {
        console.warn('[🌍 GLOBAL FEED] No data or error in response:', data);
        return {
          photos: [],
          nextCursor: null,
          hasMore: false,
          totalCount: 0,
          cursor: currentCursor || '0'
        };
      }
      
      const result = {
        photos: data.photos || [],
        nextCursor: data.nextCursor || null,
        hasMore: data.hasMore || false,
        totalCount: data.totalCount || 0,
        cursor: data.cursor || currentCursor || '0'
      };
      
      return result;

    } catch (error) {
      console.error('[🌍 GLOBAL FEED] Error:', error);
      // Retornar dados vazios em caso de erro
      return {
        photos: [],
        nextCursor: null,
        hasMore: false,
        totalCount: 0,
        cursor: currentCursor || '0'
      };
    }
  }, [limit, hotel]);

  // Query principal
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['global-photo-feed', hotel, cursor],
    queryFn: () => {
      return fetchGlobalPhotos(cursor);
    },
    enabled: true,
    staleTime: 0, // Não usar cache para garantir que sempre busque dados frescos quando cursor muda
    gcTime: 5 * 60 * 1000, // Manter em memória por 5 minutos
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Função para carregar mais fotos com debounce
  const loadMore = useCallback(async () => {
    // Verificar condições antes de fazer qualquer coisa
    if (isLoadingMore) {
      return;
    }
    
    if (!data?.hasMore) {
      return;
    }
    
    const nextCursor = data.nextCursor;
    if (!nextCursor) {
      return;
    }

    // Verificar se já estamos carregando essa página (evitar duplicatas)
    const nextPageOffset = parseInt(nextCursor);
    const currentPageOffset = cursor ? parseInt(cursor) : 0;
    
    if (nextPageOffset <= currentPageOffset) {
      // Já estamos nessa página ou além dela
      return;
    }
    
    console.log(
      `[🌍 GLOBAL FEED] Loading more photos (page offset: ${nextPageOffset}, hotel: ${hotel})...`,
    );
    
    setIsLoadingMore(true);
    
    try {
      // Aguardar um pouco para evitar múltiplas chamadas simultâneas
      await new Promise(resolve => setTimeout(resolve, 300));
      setCursor(nextCursor);
      // O isLoadingMore será resetado quando a query completar (via useEffect)
    } catch (error) {
      console.error('[🌍 GLOBAL FEED] Error loading more:', error);
      setIsLoadingMore(false);
    }
  }, [data?.hasMore, data?.nextCursor, isLoadingMore, data, cursor, hotel]);

  // Função para resetar o feed
  const resetFeed = useCallback(() => {
    console.log('[🌍 GLOBAL FEED] Resetting feed');
    setCursor(undefined);
    setAllPhotos([]);
    setIsLoadingMore(false);
  }, []);

  // Função para refresh manual (reseta tudo)
  const refreshFeed = useCallback(async () => {
    resetFeed();
    await refetch();
  }, [resetFeed, refetch]);

  // Função para verificar e adicionar apenas novas fotos no topo (sem resetar o feed)
  const checkForNewPhotos = useCallback(async (): Promise<{ count: number; newPhotoIds: string[] }> => {
    try {
      console.log('[🌍 GLOBAL FEED] Checking for new photos (preserving existing feed)...');
      
      // Buscar apenas a primeira página (cursor=0) para verificar novas fotos
      const hotelCode = hotel === 'com.br' ? 'br' : hotel;
      const { data, error } = await supabase.functions.invoke('habbo-global-feed', {
        body: {
          cursor: '0',
          limit,
          hotel: hotelCode
        }
      });

      if (error || !data || !data.photos) {
        console.log('[🌍 GLOBAL FEED] No new photos found or error occurred');
        return { count: 0, newPhotoIds: [] };
      }

      // Comparar com fotos existentes e pegar apenas as novas (que não estão no feed)
      const existingPhotoIds = new Set(allPhotos.map(p => p.id || p.photo_id));
      const newPhotos = data.photos.filter((p: EnhancedPhoto) => {
        const photoId = p.id || p.photo_id;
        return !existingPhotoIds.has(photoId);
      });

      if (newPhotos.length > 0) {
        console.log(`[🌍 GLOBAL FEED] Found ${newPhotos.length} new photos, adding to top`);
        
        // Extrair IDs das novas fotos
        const newPhotoIds = newPhotos.map(p => p.id || p.photo_id).filter(Boolean) as string[];
        
        // Adicionar novas fotos no INÍCIO do array (topo do feed)
        setAllPhotos(prev => [...newPhotos, ...prev]);
        
        return { count: newPhotos.length, newPhotoIds };
      } else {
        console.log('[🌍 GLOBAL FEED] No new photos found');
        return { count: 0, newPhotoIds: [] };
      }
    } catch (error) {
      console.error('[🌍 GLOBAL FEED] Error checking for new photos:', error);
      return { count: 0, newPhotoIds: [] };
    }
  }, [hotel, limit, allPhotos]);

  // Atualizar lista de fotos quando dados mudarem
  useEffect(() => {
    if (data?.photos) {
      setAllPhotos(prev => {
        // Detectar se é primeira carga: cursor é undefined ou '0' (ou primeiro carregamento)
        const currentCursor = cursor || '0';
        const isFirstLoad = currentCursor === '0' || currentCursor === undefined || prev.length === 0;
        
        // Se não for primeira carga e já temos fotos, adicionar novas fotos
        if (!isFirstLoad && prev.length > 0) {
          // Adicionar novas fotos ao final, evitando duplicatas
          const existingPhotoIds = new Set(prev.map(p => p.id || p.photo_id));
          const newPhotos = data.photos.filter((p: EnhancedPhoto) => {
            const photoId = p.id || p.photo_id;
            return !existingPhotoIds.has(photoId);
          });
          
          if (newPhotos.length > 0) {
            console.log(`[🌍 GLOBAL FEED] Adding ${newPhotos.length} new photos (cursor: ${currentCursor}, ${data.photos.length - newPhotos.length} duplicates filtered)`);
            return [...prev, ...newPhotos];
          } else {
            console.log(`[🌍 GLOBAL FEED] All ${data.photos.length} photos were duplicates, not adding (cursor: ${currentCursor})`);
            return prev;
          }
        } else {
          // Substituir todas as fotos (refresh ou primeira carga)
          return data.photos;
        }
      });
      
      // Resetar isLoadingMore quando dados chegarem
      if (isLoadingMore) {
        setIsLoadingMore(false);
      }
    } else if (data && (!data.photos || data.photos.length === 0) && isLoadingMore) {
      // Se não há fotos mas a query completou, resetar loading
      console.log('[🌍 GLOBAL FEED] No photos in response, resetting loading state');
      setIsLoadingMore(false);
    }
  }, [data, cursor, isLoadingMore]);

  // Cache local para melhor performance
  useEffect(() => {
    if (enableCache && allPhotos.length > 0) {
      const cacheKey = getCacheKey();
      const cacheData = {
        photos: allPhotos,
        timestamp: new Date().toISOString(),
        cursor: cursor || '0'
      };
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('[🌍 GLOBAL FEED] Cache save failed:', error);
      }
    }
  }, [allPhotos, cursor, enableCache, getCacheKey]);

  // Carregar cache na inicialização
  useEffect(() => {
    if (enableCache && allPhotos.length === 0) {
      const cacheKey = getCacheKey();
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = new Date().getTime() - new Date(parsed.timestamp).getTime();
          
          // Usar cache se for mais recente que cacheTime
          if (cacheAge < cacheTime * 60 * 1000) {
            setAllPhotos(parsed.photos);
            if (parsed.cursor !== '0') {
              setCursor(parsed.cursor);
            }
          }
        }
      } catch (error) {
        console.warn('[🌍 GLOBAL FEED] Cache load failed:', error);
      }
    }
  }, [enableCache, allPhotos.length, getCacheKey, cacheTime]);

  // Estatísticas do feed
  const stats = {
    totalPhotos: allPhotos.length,
    hasMore: data?.hasMore || false,
    isLoadingMore,
    lastUpdate: data ? new Date().toISOString() : null,
    cacheAge: enableCache ? (() => {
      const cacheKey = getCacheKey();
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          return new Date().getTime() - new Date(parsed.timestamp).getTime();
        }
      } catch {}
      return null;
    })() : null
  };

  // Verificar se ainda há mais fotos disponíveis
  const hasMoreAvailable = data?.hasMore || false;
  const currentPageOffset = cursor ? parseInt(cursor) : 0;
  const canLoadMore = hasMoreAvailable;
  
  return {
    photos: allPhotos,
    isLoading,
    isLoadingMore,
    error,
    hasMore: canLoadMore,
    loadMore,
    resetFeed,
    refreshFeed,
    checkForNewPhotos,
    stats: {
      ...stats,
      currentPageOffset,
      canLoadMore
    },
    // Funções utilitárias
    formatTimestamp: formatHabboTimestamp,
    getPhotoById: (id: string) => allPhotos.find(photo => photo.id === id),
    getPhotosByUser: (userName: string) => allPhotos.filter(photo => photo.userName === userName),
    getRecentPhotos: (hours: number = 24) => {
      const cutoff = new Date().getTime() - (hours * 60 * 60 * 1000);
      return allPhotos.filter(photo => new Date(photo.timestamp).getTime() > cutoff);
    }
  };
};
