
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUserByName as getUserByNameMultiHotel, getUserById as getUserByIdMultiHotel } from '@/services/habboApiMultiHotel';

export interface CompleteProfileStats {
  level: number;
  levelPercent: number;
  experience: number;
  starGems: number;
  badgesCount: number;
  friendsCount: number;
  groupsCount: number;
  roomsCount: number;
  photosCount: number;
  habboTickerCount: number;
}

export interface CompleteProfileData {
  badges: any[];
  friends: any[];
  groups: any[];
  rooms: any[];
  photos: any[];
  selectedBadges: any[];
}

export interface CompleteProfile {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  stats: CompleteProfileStats;
  data: CompleteProfileData;
  hotelDomain?: string;
  hotelCode?: string;
}

export const useCompleteProfile = (username: string, hotel: string = 'com.br', uniqueId?: string) => {
  // Normalizar username: se for string vazia ou apenas espaços, tratar como inválido
  // IMPORTANTE: Se username for string vazia, normalizar para '' mas ainda permitir busca por uniqueId
  const normalizedUsername = (username && typeof username === 'string') ? username.trim() : '';
  // Query é válida se temos username OU uniqueId (conforme documentação)
  const isValidUsername = normalizedUsername !== '' || !!uniqueId;
  
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCompleteProfile.tsx:hook-entry',message:'useCompleteProfile chamado',data:{username:username || 'undefined',usernameType:typeof username,hotel:hotel,uniqueId:uniqueId || 'undefined',normalizedUsername:normalizedUsername || 'undefined',isValidUsername:isValidUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }, [username, hotel, uniqueId, normalizedUsername, isValidUsername]);
  // #endregion
  
  return useQuery({
    queryKey: ['complete-profile', normalizedUsername, hotel, uniqueId],
    queryFn: async (): Promise<CompleteProfile> => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCompleteProfile.tsx:queryFn-entry',message:'queryFn iniciado',data:{normalizedUsername:normalizedUsername || 'undefined',uniqueId:uniqueId || 'undefined',hotel:hotel},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      if (!normalizedUsername && !uniqueId) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCompleteProfile.tsx:queryFn-error',message:'Erro: sem username ou uniqueId',data:{normalizedUsername:normalizedUsername || 'undefined',uniqueId:uniqueId || 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        throw new Error('Username or uniqueId is required');
      }
      
      try {
        // Validar que hotel não é um uniqueId
        const isValidHotelDomain = (domain: string): boolean => {
          if (!domain) return false;
          // Rejeitar uniqueIds (muito longos, começam com hh seguido de código e hífen)
          if (domain.length > 20) return false;
          if (domain.match(/^hh[a-z]{2}-/)) return false;
          return true;
        };
        
        // Normalizar hotel para domínio, validando que não é um uniqueId
        let preferredDomain: string;
        if (!isValidHotelDomain(hotel)) {
          console.warn(`[useCompleteProfile] Hotel inválido detectado (possível uniqueId): ${hotel}, usando fallback 'com.br'`);
          preferredDomain = 'com.br';
        } else {
          preferredDomain = hotel === 'br' ? 'com.br' : hotel;
        }
        
        // Determinar hotelCode para passar para Edge Function
        const hotelCode = preferredDomain === 'com.br' ? 'br' : preferredDomain;
        
        // Debug: verificar parâmetros recebidos
        console.log('[useCompleteProfile] Parâmetros:', {
          normalizedUsername,
          uniqueId,
          hotel: preferredDomain,
          hotelCode
        });
        
        // SOLUÇÃO SIMPLIFICADA: Chamar Edge Function diretamente com username
        // A Edge Function já faz a busca por username internamente (no servidor, sem problemas de CORS)
        // Não precisamos fazer busca no navegador primeiro - isso estava falhando
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCompleteProfile.tsx:queryFn:using-edge-function',message:'Chamando Edge Function diretamente com username',data:{normalizedUsername:normalizedUsername,hotel:hotelCode,uniqueIdParam:uniqueId || 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        // Se não temos username mas temos uniqueId, ainda podemos tentar buscar
        // A Edge Function agora aceita uniqueId como parâmetro alternativo
        if ((!normalizedUsername || normalizedUsername.trim() === '') && !uniqueId) {
          throw new Error('Username or uniqueId is required to fetch complete profile');
        }
        
        // Usar Edge Function habbo-complete-profile que já existe e funciona
        // Ela faz a busca por username no servidor (sem problemas de CORS)
        // Agora também aceita uniqueId como parâmetro alternativo
        // ESTRATÉGIA: Se temos username, SEMPRE buscar por username primeiro para obter o uniqueId correto
        // Se não temos username mas temos uniqueId, usar o uniqueId diretamente
        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('habbo-complete-profile', {
          body: {
            username: normalizedUsername || undefined, // Usar username normalizado (ou undefined se não houver)
            uniqueId: uniqueId || undefined, // Passar uniqueId também (se disponível)
            hotel: hotelCode // Passar código do hotel (br, com, es, etc.)
          }
        });
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCompleteProfile.tsx:queryFn:edge-function-response',message:'Resposta da Edge Function recebida',data:{hasData:!!edgeFunctionData,hasError:!!edgeFunctionError,error:edgeFunctionError?.message || 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        if (edgeFunctionError || !edgeFunctionData) {
          throw new Error(edgeFunctionError?.message || 'Failed to fetch complete profile from Edge Function');
        }
        
        // A Edge Function retorna os dados no formato esperado
        const profileData = edgeFunctionData;
        
        // Garantir que friends tenha todos os campos necessários
        const friends = (profileData.friends || []).map((friend: any) => ({
          ...friend,
          name: friend.name || friend.username || 'Nome não disponível',
          uniqueId: friend.uniqueId || friend.id || '',
          motto: friend.motto || '',
          online: friend.online !== undefined ? friend.online : false,
          figureString: friend.figureString || '',
          profileVisible: friend.profileVisible == null ? true : friend.profileVisible
        }));
        
        // Determinar hotelDomain a partir dos dados retornados ou parâmetros
        const hotelDomain = preferredDomain;
        
        console.log(`[useCompleteProfile] ✅ Dados obtidos da Edge Function:`, {
          badges: (profileData.badges || []).length,
          friends: friends.length,
          groups: (profileData.groups || []).length,
          rooms: (profileData.rooms || []).length,
          uniqueId: profileData.uniqueId
        });
        
        return {
          uniqueId: profileData.uniqueId,
          name: profileData.name,
          figureString: profileData.figureString,
          motto: profileData.motto || '',
          online: profileData.online !== undefined ? profileData.online : false,
          lastAccessTime: profileData.lastAccessTime || '',
          memberSince: profileData.memberSince || '',
          profileVisible: profileData.profileVisible !== false,
          stats: {
            level: profileData.stats?.level || 0,
            levelPercent: profileData.stats?.levelPercent || 0,
            experience: 0, // Não disponível na Edge Function atual
            starGems: profileData.stats?.level || 0, // Usar level como aproximação
            badgesCount: (profileData.badges || []).length,
            friendsCount: friends.length,
            groupsCount: (profileData.groups || []).length,
            roomsCount: (profileData.rooms || []).length,
            photosCount: 0, // Será preenchido pelo useUnifiedPhotoSystem
            habboTickerCount: 0
          },
          hotelDomain,
          hotelCode,
          data: {
            badges: profileData.badges || [],
            friends: friends,
            groups: profileData.groups || [],
            rooms: profileData.rooms || [],
            photos: [], // Será preenchido pelo useUnifiedPhotoSystem
            selectedBadges: profileData.selectedBadges || []
          }
        };
      } catch (error: any) {
        console.error('❌ [useCompleteProfile] Erro:', error);
        throw new Error(error.message || 'Failed to fetch complete profile');
      }
    },
    enabled: isValidUsername, // Só habilitar se houver username válido ou uniqueId
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

