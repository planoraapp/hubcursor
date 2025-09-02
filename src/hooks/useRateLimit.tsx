
import { useRef, useCallback } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const requestTimes = useRef<number[]>([]);

  const canMakeRequest = useCallback(() => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Remove requests outside the time window
    requestTimes.current = requestTimes.current.filter(time => time > windowStart);
    
    return requestTimes.current.length < config.maxRequests;
  }, [config.maxRequests, config.windowMs]);

  const makeRequest = useCallback(() => {
    if (canMakeRequest()) {
      requestTimes.current.push(Date.now());
      return true;
    }
    return false;
  }, [canMakeRequest]);

  const getRemainingRequests = useCallback(() => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    requestTimes.current = requestTimes.current.filter(time => time > windowStart);
    
    return Math.max(0, config.maxRequests - requestTimes.current.length);
  }, [config.maxRequests, config.windowMs]);

  const getResetTime = useCallback(() => {
    if (requestTimes.current.length === 0) return 0;
    
    const oldestRequest = Math.min(...requestTimes.current);
    return oldestRequest + config.windowMs;
  }, [config.windowMs]);

  return {
    canMakeRequest,
    makeRequest,
    getRemainingRequests,
    getResetTime
  };
};

// Hook para debounce
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;

  return debouncedCallback;
};
