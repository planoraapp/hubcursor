import React from 'react';

// Category icon SVGs (inline to avoid external dependencies)
const CategoryIcons = {
  hr: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C8.14 2 5 5.14 5 9c0 3.86 7 13 7 13s7-9.14 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  
  hd: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="8" cy="10" r="1"/>
      <circle cx="16" cy="10" r="1"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    </svg>
  ),
  
  ch: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
    </svg>
  ),
  
  cc: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c-1.04 0-2 .52-2.58 1.36L7.5 7H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-1.5l-1.92-3.64C14.02 2.52 13.04 2 12 2z"/>
    </svg>
  ),
  
  cp: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 1l-1.71 1.97c-.19.3-.29.65-.29 1.03 0 1.1.89 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01z"/>
    </svg>
  ),
  
  ca: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17 2v20l-5-3-5 3V2z"/>
    </svg>
  ),
  
  wa: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3.27 2L2 3.27l4.73 4.73V11c0 2.21 1.79 4 4 4s4-1.79 4-4V8.27L20.73 14 22 12.73 3.27 2zM12 17c-2.76 0-5-2.24-5-5v-1.17l8.83 8.83c-.94.22-1.94.34-2.83.34H7v2h10v-2h-5z"/>
    </svg>
  ),
  
  sh: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 8H3V9h9v2zm7-4H3V5h16v2z"/>
    </svg>
  ),
  
  lg: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7 10l5 5 5-5z"/>
      <path d="M7 14l5-5 5 5z"/>
    </svg>
  ),
  
  ha: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  
  he: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
    </svg>
  ),
  
  ea: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="8"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  
  fa: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  
  ey: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  )
};

// Category names mapping
export const CATEGORY_NAMES: Record<string, string> = {
  hr: 'Cabelo',
  hd: 'Chapéu', 
  ch: 'Peito',
  cc: 'Camisa',
  cp: 'Calça',
  ca: 'Acessório',
  wa: 'Cintura',
  sh: 'Sapatos',
  lg: 'Pernas',
  ha: 'Mãos',
  he: 'Cabeça',
  ea: 'Orelhas',
  fa: 'Rosto',
  ey: 'Olhos'
};

interface CategoryIconProps {
  category: string;
  isActive?: boolean;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  isActive = false, 
  className = "" 
}) => {
  const IconComponent = CategoryIcons[category as keyof typeof CategoryIcons];
  
  if (!IconComponent) {
    return (
      <div className={`w-8 h-8 bg-habbo-yellow/20 rounded flex items-center justify-center text-xs font-bold ${className}`}>
        {category.toUpperCase()}
      </div>
    );
  }
  
  return (
    <IconComponent 
      className={`w-8 h-8 ${isActive ? 'text-habbo-yellow' : 'text-white/70'} ${className}`} 
    />
  );
};

export default CategoryIcons;