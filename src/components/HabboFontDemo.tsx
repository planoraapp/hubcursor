
import React from 'react';
import { HabboSpeechBubble } from './HabboSpeechBubble';
import { HabboOverlay } from './HabboOverlay';
import { HabboTitle } from './HabboTitle';
import { HabboTooltip } from './HabboTooltip';

export const HabboFontDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
      <HabboTitle size="large" className="text-center">
        Demonstração das Fontes Volter
      </HabboTitle>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <HabboTitle size="medium">Balões de Fala</HabboTitle>
          <div className="space-y-2">
            <HabboSpeechBubble text="Olá! Bem-vindo ao Habbo Hub!" />
            <HabboSpeechBubble text="Sistema: Usuário conectado" variant="system" />
            <HabboSpeechBubble text="Psst... segredo!" variant="whisper" />
          </div>
        </div>
        
        <div className="space-y-4">
          <HabboTitle size="medium">Avatares com Overlay</HabboTitle>
          <div className="flex space-x-4">
            <HabboOverlay tooltipText="Frank - Administrador">
              <img 
                src="/assets/frank.png" 
                alt="Frank" 
                className="w-12 h-12 rounded-full border-2 border-yellow-400"
              />
            </HabboOverlay>
            
            <HabboTooltip content="Clique para ver perfil" position="bottom">
              <img 
                src="/assets/frank.png" 
                alt="Avatar" 
                className="w-12 h-12 rounded-full border-2 border-blue-400 cursor-pointer"
              />
            </HabboTooltip>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="volter-font text-sm text-gray-600">
          Fontes Volter implementadas para elementos temáticos do Habbo
        </p>
        <p className="volter-bold text-xs text-gray-500 mt-2">
          Versão Bold: Para títulos e elementos destacados
        </p>
      </div>
    </div>
  );
};
