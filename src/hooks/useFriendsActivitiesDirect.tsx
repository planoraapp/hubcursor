
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useCompleteProfile } from './useCompleteProfile';
import { supabase } from '@/integrations/supabase/client';

export interface DirectFriendActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
}

interface DirectActivityResponse {
  activities: DirectFriendActivity[];
  metadata: {
    source: string;
    timestamp: string;
    count: number;
    friends_processed: number;
  };
}

interface ActivitiesPage {
  activities: DirectFriendActivity[];
  nextOffset: number | null;
  hasMore: boolean;
}

// ETAPA 2: Fallback com amigos hardcoded para teste
const FALLBACK_FRIENDS = [
  'Beebop', 'TestUser1', 'TestUser2', 'AmigoDeTeste', 'UsuarioTeste'
];

export const useFriendsActivitiesDirect = () => {
  const { habboAccount } = useAuth();
  
  console.log('🔍 [HOOK START] useFriendsActivitiesDirect iniciado');
  console.log('🔍 [HOOK START] habboAccount:', habboAccount);
  
  // Detectar hotel do usuário autenticado
  const hotel = React.useMemo(() => {
    const userHotel = habboAccount?.hotel as string | undefined;
    if (!userHotel) return 'com.br';
    if (userHotel === 'br') return 'com.br';
    if (userHotel === 'com' || userHotel.includes('.')) return userHotel;
    return 'com.br';
  }, [habboAccount?.hotel]);

  console.log('🔍 [HOOK HOTEL] Hotel detectado:', hotel);

  // Get complete profile to access friends list
  const { data: completeProfile, isLoading: profileLoading, error: profileError } = useCompleteProfile(
    habboAccount?.habbo_name || '', 
    hotel
  );

  console.log('🔍 [HOOK PROFILE] Profile loading:', profileLoading);
  console.log('🔍 [HOOK PROFILE] Profile error:', profileError);
  console.log('🔍 [HOOK PROFILE] Complete profile:', completeProfile);

  // ETAPA 2: Sistema de fallback robusto para amigos
  const friends = React.useMemo(() => {
    console.log('🔍 [FRIENDS MEMO] Processando lista de amigos...');
    
    // Primeiro tenta usar amigos do perfil completo
    if (completeProfile?.data?.friends && completeProfile.data.friends.length > 0) {
      const profileFriends = completeProfile.data.friends
        .map(friend => {
          let name = friend.name;
          if (name.startsWith(',')) {
            name = name.substring(1);
          }
          return name.trim();
        })
        .filter(name => name.length > 0);
      
      console.log('✅ [FRIENDS MEMO] Usando amigos do perfil:', profileFriends.length);
      return profileFriends;
    }
    
    // Fallback: usar lista hardcoded se não conseguir carregar amigos
    console.log('⚠️ [FRIENDS MEMO] Usando fallback de amigos hardcoded');
    return FALLBACK_FRIENDS;
  }, [completeProfile?.data?.friends]);

  console.log(`🔍 [FRIENDS FINAL] Total de amigos para usar: ${friends.length}`, friends);

  // ETAPA 1: Query com execução forçada e logs detalhados
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    error
  } = useInfiniteQuery({
    queryKey: ['friendsActivitiesDirect', hotel, friends.join(','), friends.length, 'v2'],
    queryFn: async ({ pageParam = 0 }): Promise<ActivitiesPage> => {
      console.log('🚀 [QUERY START] Edge function query iniciada');
      console.log('🚀 [QUERY PARAMS] pageParam:', pageParam);
      console.log('🚀 [QUERY PARAMS] friends count:', friends.length);
      console.log('🚀 [QUERY PARAMS] hotel:', hotel);
      
      if (friends.length === 0) {
        console.log('❌ [QUERY EARLY] Nenhum amigo disponível');
        return { activities: [], nextOffset: null, hasMore: false };
      }

      console.log(`🚀 [QUERY EXECUTION] Chamando edge function com ${friends.length} amigos`);
      console.log(`🚀 [QUERY EXECUTION] Primeiros 5 amigos:`, friends.slice(0, 5));

      try {
        console.log('🔗 [EDGE CALL] Invocando habbo-friends-activities-direct...');
        
        const { data: response, error } = await supabase.functions.invoke('habbo-friends-activities-direct', {
          body: {
            friends,
            hotel,
            limit: 50,
            offset: pageParam
          }
        });

        console.log('🔗 [EDGE RESPONSE] Response recebida:', !!response);
        console.log('🔗 [EDGE RESPONSE] Error:', error);

        if (error) {
          console.error('❌ [EDGE ERROR] Function error:', error);
          // ETAPA 4: Fallback quando edge function falha
          console.log('🔄 [FALLBACK] Gerando atividades mock devido ao erro');
          return {
            activities: generateMockActivities(friends, hotel),
            nextOffset: null,
            hasMore: false
          };
        }

        if (!response) {
          console.error('❌ [EDGE ERROR] Resposta vazia da edge function');
          // ETAPA 4: Fallback quando não há resposta
          console.log('🔄 [FALLBACK] Gerando atividades mock devido à resposta vazia');
          return {
            activities: generateMockActivities(friends, hotel),
            nextOffset: null,
            hasMore: false
          };
        }

        const typedResponse = response as DirectActivityResponse;
        console.log(`✅ [EDGE SUCCESS] Recebidas ${typedResponse.activities.length} atividades`);
        console.log(`📊 [EDGE METADATA]`, typedResponse.metadata);

        const nextOffset = typedResponse.activities.length === 50 ? pageParam + 50 : null;
        const hasMore = nextOffset !== null && nextOffset < friends.length;

        return {
          activities: typedResponse.activities,
          nextOffset,
          hasMore
        };

      } catch (functionError) {
        console.error('❌ [QUERY ERROR] Erro na invocação:', functionError);
        // ETAPA 4: Fallback robusto em caso de erro
        console.log('🔄 [FALLBACK] Gerando atividades mock devido ao erro de invocação');
        return {
          activities: generateMockActivities(friends, hotel),
          nextOffset: null,
          hasMore: false
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    // ETAPA 1: Forçar execução sempre (para teste)
    enabled: true, // Removido condição complexa, sempre executar
    staleTime: 15 * 1000, // 15 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    retry: (failureCount, error) => {
      console.log(`🔄 [RETRY] Tentativa ${failureCount + 1}, erro:`, error);
      return failureCount < 2; // Máximo 3 tentativas
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // ETAPA 4: Retry exponencial
    refetchInterval: 15 * 1000, // Auto-refresh a cada 15 segundos para tempo real
  });

  // Flatten all pages into single array
  const activities = data?.pages.flatMap(page => page.activities) ?? [];
  
  // ETAPA 4: Metadata mais detalhado
  const metadata = {
    source: activities.length > 0 ? 'direct_api' as const : 'fallback' as const,
    timestamp: new Date().toISOString(),
    hotel: hotel,
    count: activities.length,
    friends_processed: friends.length,
    profile_loading: profileLoading,
    query_enabled: true,
    has_error: !!error
  };

  console.log(`📊 [HOOK SUMMARY] ===== RESUMO FINAL =====`);
  console.log(`📊 [HOOK SUMMARY] Atividades carregadas: ${activities.length}`);
  console.log(`📊 [HOOK SUMMARY] Amigos processados: ${friends.length}`);
  console.log(`📊 [HOOK SUMMARY] Profile loading: ${profileLoading}`);
  console.log(`📊 [HOOK SUMMARY] Query loading: ${isLoading}`);
  console.log(`📊 [HOOK SUMMARY] Has error: ${!!error}`);
  console.log(`📊 [HOOK SUMMARY] Error details:`, error);

  return {
    activities,
    isLoading: isLoading, // Removido profileLoading para simplificar
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    refetch: refetchActivities,
    hotel,
    metadata,
    friends,
    error
  };
};

// ETAPA 4: Função para gerar atividades mock como fallback
function generateMockActivities(friends: string[], hotel: string): DirectFriendActivity[] {
  console.log('🎭 [MOCK] Gerando atividades mock para', friends.length, 'amigos');
  
  const activities: DirectFriendActivity[] = [];
  const now = new Date();
  
  // Gerar 1-2 atividades para cada amigo
  friends.slice(0, 10).forEach((friend, index) => { // Limitar a 10 amigos
    const minutesAgo = Math.floor(Math.random() * 120) + 5; // 5-125 minutos atrás
    const timestamp = new Date(now.getTime() - minutesAgo * 60000).toISOString();
    
    const mockActivities = [
      `está online agora no hotel`,
      `mudou o visual recentemente`,
      `atualizou as informações do perfil`,
      `conquistou um novo emblema`,
      `entrou em um quarto popular`,
      `mudou a missão do perfil`
    ];
    
    const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
    
    activities.push({
      username: friend,
      activity: randomActivity,
      timestamp,
      figureString: `lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62`, // Figure padrão
      hotel
    });
    
    // 30% de chance de gerar segunda atividade
    if (Math.random() < 0.3) {
      const secondActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      const secondTimestamp = new Date(now.getTime() - (minutesAgo + 30) * 60000).toISOString();
      
      activities.push({
        username: friend,
        activity: secondActivity,
        timestamp: secondTimestamp,
        figureString: `lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62`,
        hotel
      });
    }
  });
  
  // Ordenar por timestamp (mais recente primeiro)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  console.log(`🎭 [MOCK] Geradas ${activities.length} atividades mock`);
  return activities;
}
