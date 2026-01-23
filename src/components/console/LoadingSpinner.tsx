import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  className = '' 
}) => {
  return (
    <img 
      src="/assets/progress_habbos.gif" 
      alt="Carregando..." 
      className={cn(className)}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
