
import { ReactNode } from 'react';

interface PanelCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const PanelCard = ({ title, children, className = '' }: PanelCardProps) => {
  return (
    <div className={`
      bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] 
      rounded-lg shadow-[2px_2px_0px_0px_#cccccc] overflow-hidden ${className}
    `}>
      {title && (
        <div className="bg-[#d1d1d1] border-b-2 border-[#5a5a5a] px-4 py-3">
          <h2 className="font-bold text-[#38332c] text-xl">{title}</h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
