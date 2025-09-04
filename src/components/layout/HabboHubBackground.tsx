import React from 'react';

interface HabboHubBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const HabboHubBackground: React.FC<HabboHubBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{ 
        backgroundImage: 'url(/assets/hubbeta.gif)',
        backgroundRepeat: 'repeat'
      }}
    >
      {children}
    </div>
  );
};

export default HabboHubBackground;
