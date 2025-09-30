import React from 'react';

interface AccentFixedTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente que corrige automaticamente caracteres acentuados problemáticos
 * na fonte Volter Goldfish, substituindo apenas os caracteres que não renderizam bem
 */
export const AccentFixedText: React.FC<AccentFixedTextProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  // Caracteres problemáticos e suas versões corrigidas com Century Gothic
  const accentReplacements: Record<string, string> = {
    'í': '<span style="font-family: \'Century Gothic\', Arial, sans-serif; font-size: inherit; line-height: inherit;">í</span>',
    'Í': '<span style="font-family: \'Century Gothic\', Arial, sans-serif; font-size: inherit; line-height: inherit;">Í</span>',
    'õ': '<span style="font-family: \'Century Gothic\', Arial, sans-serif; font-size: inherit; line-height: inherit;">õ</span>',
    'Õ': '<span style="font-family: \'Century Gothic\', Arial, sans-serif; font-size: inherit; line-height: inherit;">Õ</span>',
  };

  // Aplica as correções
  let fixedText = children;
  Object.entries(accentReplacements).forEach(([char, replacement]) => {
    fixedText = fixedText.replace(new RegExp(char, 'g'), replacement);
  });

  return (
    <span 
      className={className}
      style={{ fontFamily: 'Volter', ...style }}
      dangerouslySetInnerHTML={{ __html: fixedText }}
    />
  );
};
