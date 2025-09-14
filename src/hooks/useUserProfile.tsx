
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { unifiedHabboService } from '@/services/unifiedHabboService';
import { habboFeedService } from '@/services/habboFeedService';

interface HabboUserData {
  supabase_user_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  figure_string?: string;
  motto?: string;
  is_online?: boolean;
  created_at?: string;
  last_updated?: string;
}

export const useUserProfile = (username: string) => {
  // Fetch user data from database
  const { data: habboUser, isLoading: userLoading } = useQuery({
    queryKey: ['habbo-user', username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data, error } = await supabase
        .rpc('get_habbo_account_public_by_name', { 
          habbo_name_param: username.trim().toLowerCase() 
        });

      if (error || !data) {
                throw new Error('Usuário não encontrado');
      }

      const userData = Array.isArray(data) ? data[0] : data;
      return userData as HabboUserData;
    },
    enabled: !!username,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch profile data from Habbo API
  const { data: habboProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['habbo-profile', username, habboUser?.hotel],
    queryFn: async () => {
      if (!habboUser) return null;
      const hotel = habboUser.hotel === 'br' ? 'com.br' : (habboUser.hotel || 'com.br');
      return await unifiedHabboService.getUserProfile(username, hotel);
    },
    enabled: !!habboUser && !!username,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['habbo-photos', username, habboUser?.hotel],
    queryFn: async () => {
      if (!habboUser) return [];
      const hotel = habboUser.hotel === 'br' ? 'com.br' : (habboUser.hotel || 'com.br');
      return await unifiedHabboService.getUserPhotos(username, hotel);
    },
    enabled: !!habboUser && !!username,
    staleTime: 10 * 60 * 1000,
  });

  // Ensure user tracking
  useEffect(() => {
    if (habboUser?.habbo_id && habboUser?.habbo_name && habboUser?.hotel) {
      habboFeedService.ensureTrackedAndSynced({
        habbo_name: habboUser.habbo_name,
        habbo_id: habboUser.habbo_id,
        hotel: habboUser.hotel,
      }).catch(() => {});
    }
  }, [habboUser?.habbo_id, habboUser?.habbo_name, habboUser?.hotel]);

  const avatarUrl = habboUser?.figure_string || habboProfile?.figureString
    ? `https://www.habbo.${habboUser?.hotel}/habbo-imaging/avatarimage?figure=${habboUser?.figure_string || habboProfile?.figureString}&size=l&direction=2&head_direction=3&action=std`
    : `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=3&action=std`;

  const mergedProfile = {
    ...habboUser,
    ...habboProfile,
    figure_string: habboUser?.figure_string || habboProfile?.figureString,
    motto: habboUser?.motto || habboProfile?.motto,
    is_online: habboProfile?.online ?? habboUser?.is_online,
  };

  const stats = {
    badgesCount: habboProfile?.selectedBadges?.length || 0,
    photosCount: photos.length,
    friendsCount: undefined, // Not available in public API
    groupsCount: undefined,  // Not available in public API
  };

  return {
    habboUser: mergedProfile,
    habboProfile,
    photos,
    avatarUrl,
    stats,
    isLoading: userLoading || profileLoading || photosLoading,
    error: null,
  };
};
