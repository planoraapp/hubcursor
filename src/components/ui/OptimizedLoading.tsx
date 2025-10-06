import React from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({ 
  message = 'Carregando...', 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-white/60 mx-auto mb-4`} />
        <p className="text-white/60 text-sm">{message}</p>
      </div>
    </div>
  );
};

// Componente de loading para Suspense
export const SuspenseLoading: React.FC<{ message?: string }> = ({ message }) => (
  <OptimizedLoading 
    message={message} 
    size="lg" 
    className="h-full flex items-center justify-center" 
  />
);
