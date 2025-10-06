import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FriendPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
  timestamp: number;
  roomName?: string;
}

interface FriendsPhotosResponse {
  photos: FriendPhoto[];
  hasMore: boolean;
  nextOffset: number;
}

export const useOptimizedFriendsPhotos = (
  currentUserName: string,
  hotel: string = "br",
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery({
    queryKey: ["optimized-friends-photos", currentUserName, hotel, limit, offset],
    queryFn: async (): Promise<FriendsPhotosResponse> => {
      if (!currentUserName) {
        throw new Error("Username is required");
      }

      const { data, error } = await supabase.functions.invoke("habbo-optimized-friends-photos", {
        body: {
          username: currentUserName,
          hotel,
          limit,
          offset
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to fetch friends photos");
      }

      if (!data || data.error) {
        return { photos: [], hasMore: false, nextOffset: 0 };
      }return {
        photos: data.photos || [],
        hasMore: data.hasMore || false,
        nextOffset: data.nextOffset || 0
      };
    },
    enabled: !!currentUserName,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  });
};

// Hook para scroll infinito
export const useInfiniteFriendsPhotos = (currentUserName: string, hotel: string = "br") => {
  const [allPhotos, setAllPhotos] = useState<FriendPhoto[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading, error } = useOptimizedFriendsPhotos(
    currentUserName,
    hotel,
    20,
    offset
  );

  // Atualizar lista quando novos dados chegarem
  React.useEffect(() => {
    if (data) {
      if (offset === 0) {
        // Primeira carga - substituir lista
        setAllPhotos(data.photos);
      } else {
        // Carregamento adicional - adicionar à lista
        setAllPhotos(prev => [...prev, ...data.photos]);
      }
      setHasMore(data.hasMore);
      setIsLoadingMore(false);
    }
  }, [data, offset]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoading) {
      setIsLoadingMore(true);
      setOffset(prev => prev + 20);
    }
  }, [hasMore, isLoadingMore, isLoading]);

  const reset = useCallback(() => {
    setAllPhotos([]);
    setOffset(0);
    setHasMore(true);
    setIsLoadingMore(false);
  }, []);

  return {
    photos: allPhotos,
    isLoading: isLoading && offset === 0,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset
  };
};

