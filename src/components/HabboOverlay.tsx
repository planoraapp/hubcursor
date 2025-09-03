
import React from 'react';

interface HabboOverlayProps {
  children: React.ReactNode;
  tooltipText: string;
  className?: string;
}

export const HabboOverlay: React.FC<HabboOverlayProps> = ({
  children,
  tooltipText,
  className = ''
}) => {
  return (
    <div className={`habbo-overlay ${className}`}>
      {children}
      <div className="habbo-overlay-content">
        {tooltipText}
      </div>
    </div>
  );
};
