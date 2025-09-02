
import React from 'react';
import { Button } from '@/components/ui/button';

interface CloseButtonProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CloseButton: React.FC<CloseButtonProps> = ({ 
  onClick, 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`p-1 hover:bg-transparent ${className}`}
      title="Fechar"
    >
      <img
        src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/site_images/closewindow.gif"
        alt="Fechar"
        className={sizeClasses[size]}
        style={{ imageRendering: 'pixelated' }}
      />
    </Button>
  );
};
