
import React, { ReactNode } from 'react';

interface PageBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({ children, className = "" }) => {
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{ 
        backgroundImage: 'url("/assets/site/bghabbohub.png")',
        backgroundRepeat: 'repeat'
      }}
    >
      {children}
    </div>
  );
};
