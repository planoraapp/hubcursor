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
    hotel = 'com.br',
    enableCache = true,
    cacheTime = 5 * 24 * 60 // 5 dias em minutos (5 * 24 * 60 = 7200 minutos)
  } = options;

  const [cursor, setCursor] = useState<string | undefined>();
  const [allPhotos, setAllPhotos] = useState<EnhancedPhoto[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Cache key baseado em timestamp
  const getCacheKey = useCallback(() => {
    const now = new Date();
    const cacheDate = new Date(now.getTime() - (cacheTime * 60 * 1000));
    return `global-feed-${hotel}-${cacheDate.toISOString().split('T')[0]}`;
  }, [hotel, cacheTime]);

  // Função para buscar fotos usando Supabase Function (como funcionava antes)
  const fetchGlobalPhotos = useCallback(async (currentCursor?: string): Promise<GlobalPhotoFeedData> => {try {
      const startIndex = currentCursor ? parseInt(currentCursor) : 0;
      const endIndex = startIndex + limit - 1;

      // Usar função Supabase para buscar fotos globais (como outros hooks fazem)
      const { data, error } = await supabase.functions.invoke('habbo-global-feed', {
        body: {
          cursor: currentCursor,
          limit,
          hotel: 'br' // Corrigido: usar 'br' onde estão as fotos
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
      }// Debug: verificar usuários únicos
      if (data.photos && data.photos.length > 0) {
        const uniqueUsers = [...new Set(data.photos.map((p: any) => p.userName))];
        console.log(`[🌍 GLOBAL FEED] Unique users found: ${uniqueUsers.join(', ')}`);// Debug: verificar se há mais fotos no banco (sem filtro de hotel)}

      return {
        photos: data.photos || [],
        nextCursor: data.nextCursor || null,
        hasMore: data.hasMore || false,
        totalCount: data.totalCount || 0,
        cursor: data.cursor || startIndex.toString()
      };

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
    queryFn: () => fetchGlobalPhotos(cursor),
    enabled: true,
    staleTime: cacheTime * 60 * 1000, // Cache por X minutos
    gcTime: (cacheTime + 5) * 60 * 1000, // Manter em memória por mais tempo
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Função para carregar mais fotos
  const loadMore = useCallback(async () => {
    if (!data?.hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextCursor = data.nextCursor;
      if (nextCursor) {
        setCursor(nextCursor);
      }
    } catch (error) {
      console.error('[🌍 GLOBAL FEED] Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [data?.hasMore, data?.nextCursor, isLoadingMore]);

  // Função para resetar o feed
  const resetFeed = useCallback(() => {
    setCursor(undefined);
    setAllPhotos([]);
  }, []);

  // Função para refresh manual
  const refreshFeed = useCallback(async () => {
    resetFeed();
    await refetch();
  }, [resetFeed, refetch]);

  // Atualizar lista de fotos quando dados mudarem
  useEffect(() => {
    if (data?.photos) {
      setAllPhotos(prev => {
        if (cursor) {
          // Adicionar novas fotos ao final
          return [...prev, ...data.photos];
        } else {
          // Substituir todas as fotos (refresh)
          return data.photos;
        }
      });
    }
  }, [data, cursor]);

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
            }}
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

  return {
    photos: allPhotos,
    isLoading,
    isLoadingMore,
    error,
    hasMore: data?.hasMore || false,
    loadMore,
    resetFeed,
    refreshFeed,
    stats,
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
