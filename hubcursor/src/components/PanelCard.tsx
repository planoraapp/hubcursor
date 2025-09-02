
import { ReactNode } from 'react';

interface PanelCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const PanelCard = ({ title, children, className = '' }: PanelCardProps) => {
  return (
    <div className={`bg-white rounded-lg border-2 border-black shadow-lg ${className}`}>
      {title && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 border-b-2 border-black rounded-t-md">
          <h2 className="text-white font-bold text-lg volter-font" style={{
            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
          }}>
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
