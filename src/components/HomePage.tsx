import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserByName } from '../services/habboApi';
import { News } from './News';
import Rankings from './Rankings';

export const HomePage = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const [habboData, setHabboData] = useState<any>(null);

  useEffect(() => {
    if (isLoggedIn && habboAccount) {
      getUserByName(habboAccount.habbo_name).then(data => {
        setHabboData(data);
      }).catch(console.error);
    }
  }, [isLoggedIn, habboAccount]);

  // Avatar para desktop - cabeça + torso
  const desktopAvatarUrl = isLoggedIn && habboData ? 
    `https://www.habbo.com/habbo-imaging/avatarimage?figure=${habboData.figureString}&direction=2&head_direction=2&gesture=sml&size=m&frame=1&headonly=0` 
    : 'https://www.habbo.com/habbo-imaging/avatarimage?user=Frank&action=std&direction=2&head_direction=2&gesture=sml&size=m&frame=1&headonly=0';

  return (
    <div className="space-y-6">
      {/* Avatar de destaque para desktop */}
      <div className="text-center py-6">
        <div className="inline-block relative">
          <div 
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-black shadow-2xl mx-auto"
            style={{
              background: 'linear-gradient(135deg, #f5f5dc 0%, #e6e6dc 100%)',
              padding: '8px'
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img
                src={desktopAvatarUrl}
                alt={isLoggedIn && habboAccount ? habboAccount.habbo_name : 'Frank'}
                className="w-full h-full object-contain object-center"
                style={{ 
                  transform: 'scale(1.2)', 
                  transformOrigin: 'center top'
                }}
              />
            </div>
          </div>
          
          {/* Status online indicator */}
          <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg ${
            isLoggedIn && habboAccount ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        </div>
        
        {/* Nome do usuário */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-black volter-font">
            {isLoggedIn && habboAccount ? habboAccount.habbo_name : 'Visitante'}
          </h2>
          {habboData?.motto && (
            <p className="text-gray-700 italic mt-1">"{habboData.motto}"</p>
          )}
        </div>
      </div>

      {/* Seção de Notícias */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border-2 border-black">
        <h2 className="text-2xl font-bold mb-4 text-black volter-font">
          📰 Últimas Notícias
        </h2>
        <News />
      </div>

      {/* Seção de Rankings */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border-2 border-black">
        <h2 className="text-2xl font-bold mb-4 text-black volter-font">
          🏆 Rankings
        </h2>
        <Rankings />
      </div>
    </div>
  );
};
