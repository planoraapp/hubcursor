import React from 'react';
import { FunctionalConsole } from './FunctionalConsole';

/**
 * PopupConsole - Componente para exibir o console em janela popup
 * Usa o mesmo FunctionalConsole da página /console para garantir
 * dimensões e funcionalidades idênticas (375x750px)
 */
const PopupConsole: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[375px]">
        <FunctionalConsole />
      </div>
    </div>
  );
};

export default PopupConsole;
