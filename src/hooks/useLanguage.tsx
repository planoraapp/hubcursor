
import { useState } from 'react';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');

  return {
    currentLanguage,
    setCurrentLanguage,
  };
};
