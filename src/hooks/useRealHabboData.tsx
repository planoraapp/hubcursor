import { useMemo } from 'react';
import { unifiedHabboApiService } from '@/services/unifiedHabboApiService';
import { useBackgroundSync } from './useBackgroundSync';

// Dados reais confirmados pela API do Habbo
const REAL_HABBO_DATA = {
  habbohub: {
    id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
    name: 'habbohub',
    hotel: 'br',
    motto: 'HUB-QQ797',
    figureString: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
    online: false,
    admin: true,
    background: {
      type: 'image',
      value: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/bg_pattern_clouds.gif'
    }
  },
  Beebop: {
    id: 'hhbr-00e6988dddeb5a1838658c854d62fe49',
    name: 'Beebop',
    hotel: 'br',
    motto: 'HUB-ACTI1',
    figureString: 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
    online: false,
    admin: false,
    background: {
      type: 'image',
      value: '/assets/bghabbohub.png'
    }
  }
};

export const useRealHabboData = () => {
  const { syncData } = useBackgroundSync();
  
  const realUsers = useMemo(() => {
    return Object.values(REAL_HABBO_DATA).map(user => {
      // Usar dados sincronizados se disponíveis, senão usar dados hardcoded
      let background = user.background;
      
      if (syncData) {
        if (user.name.toLowerCase() === 'habbohub') {
          background = syncData.habbohub;
        } else if (user.name.toLowerCase() === 'beebop') {
          background = syncData.beebop;
        }
      }
      
      return {
        user_id: user.id,
        habbo_name: user.name,
        hotel: user.hotel,
        background_type: background.type,
        background_value: background.value,
        updated_at: new Date().toISOString(),
        average_rating: 4.5,
        ratings_count: 10
      };
    });
  }, [syncData]);

  const getRealUserData = (username: string) => {
    const lowerUsername = username.toLowerCase();
    if (lowerUsername === 'habbohub') return REAL_HABBO_DATA.habbohub;
    if (lowerUsername === 'beebop') return REAL_HABBO_DATA.Beebop;
    return null;
  };

  const isRealUser = (username: string) => {
    const lowerUsername = username.toLowerCase();
    return lowerUsername === 'habbohub' || lowerUsername === 'beebop';
  };

  const getRealUserById = (userId: string) => {
    if (userId === REAL_HABBO_DATA.habbohub.id) return REAL_HABBO_DATA.habbohub;
    if (userId === REAL_HABBO_DATA.Beebop.id) return REAL_HABBO_DATA.Beebop;
    return null;
  };

  const detectHotelFromUserId = (userId: string) => {
    return unifiedHabboApiService.detectHotelFromUserId(userId);
  };

  const isHotelSupported = (hotel: string) => {
    return unifiedHabboApiService.isHotelSupported(hotel);
  };

  return {
    realUsers,
    getRealUserData,
    isRealUser,
    getRealUserById,
    detectHotelFromUserId,
    isHotelSupported,
    REAL_HABBO_DATA
  };
};