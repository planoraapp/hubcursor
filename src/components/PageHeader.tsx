
import React from 'react';

interface PageHeaderProps {
  title: string;
  backgroundImage?: string;
  icon?: string;
}

export const PageHeader = ({
  title,
  backgroundImage,
  icon
}: PageHeaderProps) => {
  return (
    <div 
      className="relative mb-6 p-6 rounded-lg overflow-hidden border-2 border-black" 
      style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="relative z-10 flex items-center space-x-4">
        {icon && <img src={icon} alt={title} className="w-12 h-12" style={{ imageRendering: 'pixelated' }} />}
        <h1 className="text-2xl font-bold volter-font habbo-outline-lg">
          {title}
        </h1>
      </div>
    </div>
  );
};
