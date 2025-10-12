import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

interface CommentAction {
  photoId: string;
  timestamp: number;
}

interface RateLimitStatus {
  canComment: boolean;
  error?: string;
  nextAvailableTime?: Date;
  level: 'normal' | 'photo-restricted' | 'global-restricted';
}

/**
 * Sistema de Rate Limiting em Camadas para Comentários
 * 
 * Camada 1: 1 comentário por foto a cada 30 segundos
 * Camada 2: Máximo 3 comentários por foto em 10 minutos → Restrição de 1 hora naquela foto
 * Camada 3: Comportamento de spam detectado → Bloqueio global de 6 horas
 */
export const useCommentRateLimit = () => {
  const { habboAccount } = useAuth();
  const [actions, setActions] = useState<CommentAction[]>([]);
  const [photoRestrictions, setPhotoRestrictions] = useState<Map<string, number>>(new Map());
  const [globalRestriction, setGlobalRestriction] = useState<number | null>(null);

  // Configurações
  const BASIC_INTERVAL = 30 * 1000; // 30 segundos
  const COMMENT_LIMIT = 3; // 3 comentários
  const WINDOW_TIME = 10 * 60 * 1000; // 10 minutos
  const PHOTO_RESTRICTION_TIME = 60 * 60 * 1000; // 1 hora
  const GLOBAL_RESTRICTION_TIME = 6 * 60 * 60 * 1000; // 6 horas
  const SPAM_THRESHOLD = 3; // 3 fotos com restrição ativa = spam

  // Carregar dados do localStorage
  useEffect(() => {
    if (!habboAccount?.supabase_user_id) return;

    const key = `comment_rate_limit_${habboAccount.supabase_user_id}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setActions(data.actions || []);
        setPhotoRestrictions(new Map(data.photoRestrictions || []));
        setGlobalRestriction(data.globalRestriction || null);
      } catch (error) {
        console.error('Erro ao carregar rate limit:', error);
      }
    }
  }, [habboAccount?.supabase_user_id]);

  // Salvar dados no localStorage
  const saveToStorage = useCallback((
    newActions: CommentAction[],
    newPhotoRestrictions: Map<string, number>,
    newGlobalRestriction: number | null
  ) => {
    if (!habboAccount?.supabase_user_id) return;

    const key = `comment_rate_limit_${habboAccount.supabase_user_id}`;
    const data = {
      actions: newActions,
      photoRestrictions: Array.from(newPhotoRestrictions.entries()),
      globalRestriction: newGlobalRestriction
    };
    localStorage.setItem(key, JSON.stringify(data));
  }, [habboAccount?.supabase_user_id]);

  /**
   * Verifica se o usuário pode comentar em uma foto
   */
  const checkCanComment = useCallback((photoId: string): RateLimitStatus => {
    const now = Date.now();

    // Limpar restrições expiradas
    const activePhotoRestrictions = new Map(photoRestrictions);
    for (const [pid, restrictionEnd] of activePhotoRestrictions) {
      if (now > restrictionEnd) {
        activePhotoRestrictions.delete(pid);
      }
    }

    // Verificar bloqueio global
    if (globalRestriction && now < globalRestriction) {
      const waitTime = globalRestriction - now;
      return {
        canComment: false,
        level: 'global-restricted',
        nextAvailableTime: new Date(globalRestriction),
        error: `Comportamento de spam detectado. Comentários bloqueados por ${Math.ceil(waitTime / (60 * 60 * 1000))} horas.`
      };
    }

    // Verificar restrição específica da foto
    const photoRestrictionEnd = activePhotoRestrictions.get(photoId);
    if (photoRestrictionEnd && now < photoRestrictionEnd) {
      const waitTime = photoRestrictionEnd - now;
      return {
        canComment: false,
        level: 'photo-restricted',
        nextAvailableTime: new Date(photoRestrictionEnd),
        error: `Você comentou muito nesta foto. Aguarde ${Math.ceil(waitTime / (60 * 1000))} minutos.`
      };
    }

    // Limpar ações antigas (fora da janela de tempo)
    const recentActions = actions.filter(a => now - a.timestamp < WINDOW_TIME);

    // Verificar ações na foto específica
    const photoActions = recentActions.filter(a => a.photoId === photoId);

    // Camada 1: Verificar intervalo básico (30 segundos)
    const lastActionOnPhoto = photoActions[photoActions.length - 1];
    if (lastActionOnPhoto) {
      const timeSinceLastAction = now - lastActionOnPhoto.timestamp;
      if (timeSinceLastAction < BASIC_INTERVAL) {
        const waitTime = BASIC_INTERVAL - timeSinceLastAction;
        return {
          canComment: false,
          level: 'normal',
          nextAvailableTime: new Date(now + waitTime),
          error: `Aguarde ${Math.ceil(waitTime / 1000)} segundos antes de comentar novamente nesta foto.`
        };
      }
    }

    // Camada 2: Verificar se atingiu o limite de comentários (3 em 10 min)
    if (photoActions.length >= COMMENT_LIMIT) {
      return {
        canComment: false,
        level: 'photo-restricted',
        error: `Você atingiu o limite de ${COMMENT_LIMIT} comentários nesta foto. Tente novamente em alguns minutos.`
      };
    }

    return {
      canComment: true,
      level: 'normal'
    };
  }, [actions, photoRestrictions, globalRestriction]);

  /**
   * Registra um comentário e aplica penalidades se necessário
   */
  const recordComment = useCallback((photoId: string) => {
    const now = Date.now();
    const recentActions = actions.filter(a => now - a.timestamp < WINDOW_TIME);
    const newAction: CommentAction = { photoId, timestamp: now };
    const updatedActions = [...recentActions, newAction];

    // Verificar se atingiu o limite nesta foto
    const photoActions = updatedActions.filter(a => a.photoId === photoId);
    const newPhotoRestrictions = new Map(photoRestrictions);
    let newGlobalRestriction = globalRestriction;

    if (photoActions.length >= COMMENT_LIMIT) {
      // Aplicar restrição de 1 hora nesta foto
      newPhotoRestrictions.set(photoId, now + PHOTO_RESTRICTION_TIME);
      
      // Verificar se é spam (3+ fotos com restrição ativa)
      const activeRestrictions = Array.from(newPhotoRestrictions.values())
        .filter(end => now < end);
      
      if (activeRestrictions.length >= SPAM_THRESHOLD) {
        // Aplicar bloqueio global de 6 horas
        newGlobalRestriction = now + GLOBAL_RESTRICTION_TIME;
        console.warn(`🚫 [SPAM DETECTED] User ${habboAccount?.habbo_name} blocked for 6 hours`);
      }
    }

    setActions(updatedActions);
    setPhotoRestrictions(newPhotoRestrictions);
    setGlobalRestriction(newGlobalRestriction);
    saveToStorage(updatedActions, newPhotoRestrictions, newGlobalRestriction);
  }, [actions, photoRestrictions, globalRestriction, habboAccount, saveToStorage]);

  /**
   * Reseta o rate limit (apenas para debug/admin)
   */
  const reset = useCallback(() => {
    setActions([]);
    setPhotoRestrictions(new Map());
    setGlobalRestriction(null);
    if (habboAccount?.supabase_user_id) {
      localStorage.removeItem(`comment_rate_limit_${habboAccount.supabase_user_id}`);
    }
  }, [habboAccount?.supabase_user_id]);

  return {
    checkCanComment,
    recordComment,
    reset
  };
};

