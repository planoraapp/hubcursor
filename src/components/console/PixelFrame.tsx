import React from 'react';
import { X } from 'lucide-react';

interface PixelFrameProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const PixelFrame: React.FC<PixelFrameProps> = ({ 
  title, 
  children, 
  onClose,
  className = "" 
}) => {
  return (
    <div className={`pixel-frame-outer ${className}`}>
      <div className="pixel-header-bar">
        <div className="pixel-title">{title}</div>
        <div className="pixel-pattern"></div>
        {onClose && (
          <X 
            className="pixel-close-button-svg" 
            onClick={onClose}
          />
        )}
      </div>
      <div className="pixel-inner-content">
        {children}
      </div>
    </div>
  );
};