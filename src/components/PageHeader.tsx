import React from 'react';

interface PageHeaderProps {
  title: string;
  backgroundImage?: string;
  icon?: string;
}

export const PageHeader = ({ title, backgroundImage, icon }: PageHeaderProps) => {
  return (
    <div 
      className="relative mb-6 p-6 rounded-lg overflow-hidden"
      style={{ 
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #4A90E2, #357ABD)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 flex items-center space-x-4">
        {icon && (
          <img src={icon} alt={title} className="w-12 h-12" />
        )}
        <h1 className="text-3xl font-bold text-white text-shadow-lg">
          {title}
        </h1>
      </div>
    </div>
  );
};