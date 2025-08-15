
import React, { useState, useEffect } from 'react';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { HotelPhotoFeedColumn } from '@/components/console2/HotelPhotoFeedColumn';
import { UserSearchColumn } from '@/components/console2/UserSearchColumn';

export const Console2 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    };
  }, []);

  return (
    <div 
      className={`min-h-screen bg-gray-100 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
    >
      <div className="p-4">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-2rem)]">
          {/* Coluna 1: Minha Conta (Perfil + Fotos) */}
          <div className="col-span-1">
            <MyAccountColumn />
          </div>
          
          {/* Coluna 2: Feed Geral do Hotel */}
          <div className="col-span-1">
            <HotelPhotoFeedColumn />
          </div>
          
          {/* Coluna 3: Busca de Usuários */}
          <div className="col-span-1">
            <UserSearchColumn />
          </div>
        </div>
      </div>
    </div>
  );
};
