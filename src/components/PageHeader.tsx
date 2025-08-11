
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon, 
  children 
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center shadow-sm">
              <img 
                src={icon} 
                alt="Page Icon" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white volter-font" 
                style={{
                  textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/80 mt-1"
                 style={{
                   textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
