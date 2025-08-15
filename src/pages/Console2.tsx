
import React from 'react';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { FriendsPhotoFeedColumn } from '@/components/console2/FriendsPhotoFeedColumn';
import { FriendsActivityColumn } from '@/components/console2/FriendsActivityColumn';

export const Console2 = () => {
  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-2rem)]">
          {/* Coluna 1: Minha Conta */}
          <div className="lg:col-span-1">
            <MyAccountColumn />
          </div>
          
          {/* Coluna 2: Feed de Fotos dos Amigos */}
          <div className="lg:col-span-1">
            <FriendsPhotoFeedColumn />
          </div>
          
          {/* Coluna 3: Atividades dos Amigos */}
          <div className="lg:col-span-1">
            <FriendsActivityColumn />
          </div>
        </div>
      </div>
    </div>
  );
};
