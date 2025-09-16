// Hook para consultas com debounce
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDebouncedQueryOptions {
  delay?: number;
  immediate?: boolean;
  maxWait?: number;
}

export const useDebouncedQuery = <T>(
  queryFn: () => Promise<T>,
  options: UseDebouncedQueryOptions = {}
) => {
  const {
    delay = 500,
    immediate = false,
    maxWait = 5000
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);
  
  // Limpar timeouts quando componente desmonta
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);
  
  const executeQuery = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erro na consulta';
        setError(errorMessage);
        console.error('Debounced query error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryFn]);
  
  const debouncedQuery = useCallback(() => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se for execução imediata, executar agora
    if (immediate) {
      executeQuery();
      return;
    }
    
    // Configurar timeout para execução
    timeoutRef.current = setTimeout(() => {
      executeQuery();
    }, delay);
    
    // Configurar timeout máximo (fallback)
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }
    
    maxTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        executeQuery();
      }
    }, maxWait);
  }, [executeQuery, delay, immediate, maxWait]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }
    setLoading(false);
  }, []);
  
  const reset = useCallback(() => {
    cancel();
    setData(null);
    setError(null);
    setLoading(false);
  }, [cancel]);
  
  return {
    data,
    loading,
    error,
    debouncedQuery,
    cancel,
    reset,
    executeQuery // Para execução imediata quando necessário
  };
};
