
import React from 'react';
import { AnimatedConsole } from '@/components/AnimatedConsole';

interface HomeHeaderProps {
  username: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ username }) => {
  return (
    <div className="relative mb-6">
      {/* Fundo do cabeçalho */}
      <div 
        className="relative rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-6"
        style={{
          backgroundImage: 'url(/assets/1360__-3C7.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        {/* Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Conteúdo do cabeçalho */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Console animado */}
            <div className="w-12 h-12">
              <AnimatedConsole isActive={true} className="w-full h-full" />
            </div>
            
            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-white volter-font" 
                  style={{
                    textShadow: '2px 2px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                  }}>
                🏠 Habbo Home
              </h1>
              <p className="text-white/90 text-lg volter-font"
                 style={{
                   textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                 }}>
                {username}
              </p>
            </div>
          </div>
          
          {/* Ícone adicional */}
          <div className="hidden md:block">
            <img 
              src="/assets/home.png" 
              alt="Home Icon" 
              className="w-16 h-16 opacity-80"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
