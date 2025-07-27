
import { ReactNode } from 'react';

interface PanelCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const PanelCard = ({ title, children, className = '' }: PanelCardProps) => {
  return (
    <div className={`habbo-panel ${className}`}>
      {title && (
        <div className="habbo-header">
          <h2>{title}</h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
