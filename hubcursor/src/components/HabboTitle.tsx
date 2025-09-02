
import React from 'react';

interface HabboTitleProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const HabboTitle: React.FC<HabboTitleProps> = ({
  children,
  size = 'medium',
  className = ''
}) => {
  const sizeClass = `habbo-title-${size}`;
  
  return (
    <h2 className={`habbo-title ${sizeClass} ${className}`}>
      {children}
    </h2>
  );
};
