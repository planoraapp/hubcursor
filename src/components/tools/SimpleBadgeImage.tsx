import React, { useState, useCallback, useEffect, useRef } from 'react';
import { badgeCache } from '@/lib/badge-cache';

interface SimpleBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  retryCount?: number;
  maxRetries?: number;
}

const SimpleBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md',
  retryCount = 0,
  maxRetries = 2
}: SimpleBadgeImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState(retryCount);
  const [imageSrc, setImageSrc] = useState(`/badges/c_images/album1584/${code}.gif`);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // Verificar cache na inicialização
  useEffect(() => {
    const isCached = badgeCache.isImageLoaded(code);
    const isError = badgeCache.isImageError(code);
    
    if (isCached) {
      setIsLoading(false);
      setHasError(false);
    } else if (isError) {
      setHasError(true);
      setIsLoading(false);
    }
  }, [code]);

  // Timeout para evitar loading infinito
  useEffect(() => {
    if (isLoading && !hasError) {
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          console.warn(`Timeout loading badge ${code}, attempting retry ${retryAttempts + 1}`);
          handleRetry();
        }
      }, 5000); // 5 segundos de timeout
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, hasError, code, retryAttempts]);

  const handleRetry = useCallback(() => {
    if (retryAttempts < maxRetries) {
      setRetryAttempts(prev => prev + 1);
      setHasError(false);
      setIsLoading(true);
      
      // Adicionar timestamp para forçar reload
      setImageSrc(`/badges/c_images/album1584/${code}.gif?t=${Date.now()}`);
    } else {
      setHasError(true);
      setIsLoading(false);
      badgeCache.setImageLoaded(code, false, true);
    }
  }, [retryAttempts, maxRetries, code]);

  const handleImageError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (retryAttempts < maxRetries) {
      console.warn(`Error loading badge ${code}, retrying... (${retryAttempts + 1}/${maxRetries})`);
      handleRetry();
    } else {
      setHasError(true);
      setIsLoading(false);
      badgeCache.setImageLoaded(code, false, true);
    }
  }, [code, retryAttempts, maxRetries, handleRetry]);

  const handleImageLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsLoading(false);
    setHasError(false);
    badgeCache.setImageLoaded(code, true, false);
  }, [code]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 rounded flex items-center justify-center group`}>
        <span className="text-xs text-gray-500">?</span>
        {retryAttempts > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleRetry}
              className="text-white text-xs px-2 py-1 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              title="Tentar novamente"
            >
              ↻
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
          <div className="flex flex-col items-center space-y-1">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
            {retryAttempts > 0 && (
              <span className="text-xs text-gray-500">Tentativa {retryAttempts + 1}</span>
            )}
          </div>
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={name || `Emblema ${code}`}
        className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default SimpleBadgeImage;
