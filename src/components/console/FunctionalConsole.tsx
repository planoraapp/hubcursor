// Versão otimizada - carregamento rápido
import React, { useState, lazy, Suspense, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, RefreshCw, Loader2, AlertCircle, Users, MessageSquare, Search, Trophy, Home, Crown, Camera, Heart, MessageCircle, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PixelFrame } from './PixelFrame';
import { cn } from '@/lib/utils';

// Lazy loading otimizado com fallback mais leve
const FriendsPhotoFeed = lazy(() => import('./FriendsPhotoFeed').then(module => ({ default: module.FriendsPhotoFeed })));
const FindPhotoFeedColumn = lazy(() => import('@/components/console2/FindPhotoFeedColumn').then(module => ({ default: module.FindPhotoFeedColumn })));
const GlobalPhotoFeedColumn = lazy(() => import('@/components/console2/GlobalPhotoFeedColumn').then(module => ({ default: module.GlobalPhotoFeedColumn })));

// Componentes de ícones pixelizados otimizados
const getHotelFlag = (hotel?: string) => {
  const hotelFlags: { [key: string]: string } = {
    'com': '/flags/flagcom.png',
    'br': '/flags/flagbrazil.png',
    'de': '/flags/flagdeus.png',
    'fr': '/flags/flagfrance.png',
    'it': '/flags/flagitaly.png',
    'es': '/flags/flagspain.png',
    'nl': '/flags/flagnetl.png',
    'tr': '/flags/flagtrky.png',
    'fi': '/flags/flafinland.png',
  };
  return hotelFlags[hotel || ''] || '/flags/flagcom.png';
};

// Componentes de ícones otimizados (versão simplificada)
const PixelSearchIcon = memo(({ className }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="0" y="0" width="40" height="40" fill="#ECAE00" />
    <rect x="6" y="6" width="16" height="16" fill="none" stroke="#8B4513" strokeWidth="1" />
    <rect x="18" y="18" width="8" height="8" fill="#8B4513" />
  </svg>
));

const PixelFriendsIcon = memo(({ className }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="0" y="0" width="40" height="40" fill="#ECAE00" />
    <circle cx="12" cy="12" r="4" fill="#8B4513" />
    <circle cx="28" cy="12" r="4" fill="#8B4513" />
    <rect x="8" y="20" width="24" height="12" fill="#8B4513" />
  </svg>
));

const PixelGlobalIcon = memo(({ className }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="0" y="0" width="40" height="40" fill="#ECAE00" />
    <circle cx="20" cy="20" r="12" fill="none" stroke="#8B4513" strokeWidth="2" />
    <rect x="8" y="20" width="24" height="2" fill="#8B4513" />
    <rect x="20" y="8" width="2" height="24" fill="#8B4513" />
  </svg>
));

// Fallback otimizado para Suspense
const OptimizedFallback = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Carregando...</p>
    </div>
  </div>
));

// Componente principal otimizado
export const FunctionalConsole: React.FC = memo(() => {
  const { isLoggedIn, habboAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'find' | 'global'>('friends');

  // Renderização condicional otimizada
  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <Suspense fallback={<OptimizedFallback />}>
            <FriendsPhotoFeed />
          </Suspense>
        );
      case 'find':
        return (
          <Suspense fallback={<OptimizedFallback />}>
            <FindPhotoFeedColumn />
          </Suspense>
        );
      case 'global':
        return (
          <Suspense fallback={<OptimizedFallback />}>
            <GlobalPhotoFeedColumn />
          </Suspense>
        );
      default:
        return <OptimizedFallback />;
    }
  };

  return (
    <div className="w-full max-w-[375px] mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-black shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-b-2 border-black">
          <CardTitle className="flex items-center justify-between sidebar-font-option-4">
            <span className="text-black font-bold" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.5)' }}>
              🖥️ Console Social
            </span>
            {habboAccount && (
              <div className="flex items-center gap-2">
                <img 
                  src={getHotelFlag(habboAccount.hotel)} 
                  alt={habboAccount.hotel} 
                  className="w-4 h-3"
                />
                <span className="text-xs text-black font-bold">
                  {habboAccount.name}
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Navegação otimizada */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('friends')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
                activeTab === 'friends' 
                  ? "bg-yellow-100 text-black border-b-2 border-yellow-500" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <PixelFriendsIcon className="w-4 h-4" />
              Amigos
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
                activeTab === 'find' 
                  ? "bg-yellow-100 text-black border-b-2 border-yellow-500" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <PixelSearchIcon className="w-4 h-4" />
              Buscar
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
                activeTab === 'global' 
                  ? "bg-yellow-100 text-black border-b-2 border-yellow-500" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <PixelGlobalIcon className="w-4 h-4" />
              Global
            </button>
          </div>

          {/* Conteúdo com lazy loading */}
          <div className="min-h-[400px]">
            {renderContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

FunctionalConsole.displayName = 'FunctionalConsole';