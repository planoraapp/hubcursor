
import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  PopoverFooter,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserByName, getUserBadges, getAvatarUrl, getBadgeUrl } from '../services/habboApi';
import { useI18n } from '@/contexts/I18nContext';
import { useBadgeTranslation } from '@/hooks/useBadgeTranslations';

import type { HabboData } from '@/types/habbo';
interface UserProfilePopoverProps {
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}



interface HabboBadge {
  code: string;
  name: string;
  description: string;
}

// Componente individual para cada badge com tradução
const BadgeItem: React.FC<{ badge: HabboBadge }> = ({ badge }) => {
  const { data: translationData } = useBadgeTranslation({ 
    badgeCode: badge.code 
  });

  // Usar tradução se disponível
  const displayName = translationData?.success ? translationData.translation.name : badge.name;
  const displayDescription = translationData?.success 
    ? translationData.translation.description || `Badge ${badge.code}` 
    : badge.description;

  return (
    <div 
      className="relative group cursor-help"
      title={`${displayName}: ${displayDescription}`}
    >
      <img
        src={getBadgeUrl(badge.code)}
        alt={displayName}
        className="w-8 h-8 border border-amber-200 rounded bg-white p-0.5"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({ 
  children, 
  side = 'right', 
  align = 'start',
  sideOffset = 8 
}) => {
  const { isLoggedIn, habboAccount, logout } = useAuth();
  const { t } = useI18n();
  const [habboData, setHabboData] = useState<HabboData | null>(null);
  const [badges, setBadges] = useState<HabboBadge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && habboAccount) {
      setLoading(true);
      
      Promise.all([
        getUserByName(habboAccount.habbo_name),
        getUserBadges(habboAccount.habbo_id) // This now matches the interface
      ]).then(([userData, badgeData]) => {
        if (userData) {
          setHabboData(userData);
        }
        if (badgeData) {
          setBadges(badgeData);
        }
      }).catch(console.error).finally(() => {
        setLoading(false);
      });
    }
  }, [isLoggedIn, habboAccount]);

  const handleLogin = () => {
    window.location.href = '/connect-habbo';
  };

  const handleViewProfile = () => {
    if (habboAccount) {
      window.location.href = `/profile/${habboAccount.habbo_name}`;
    }
  };

  if (!isLoggedIn || !habboAccount) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent side={side} align={align} sideOffset={sideOffset} className="w-64 bg-amber-50 border-amber-200">
          <PopoverHeader className="border-amber-200">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border border-amber-300">
                <AvatarImage src="/assets/frank.png" />
                <AvatarFallback className="bg-amber-100">V</AvatarFallback>
              </Avatar>
              <div>
                <PopoverTitle className="volter-font text-gray-800">Visitante</PopoverTitle>
                <PopoverDescription className="text-xs text-gray-600">Não conectado</PopoverDescription>
              </div>
            </div>
          </PopoverHeader>
          <PopoverBody className="space-y-3">
            <div className="text-center text-sm text-gray-600 volter-font">
              Faça login para ver seu perfil completo
            </div>
          </PopoverBody>
          <PopoverFooter>
            <Button 
              onClick={handleLogin}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white volter-font"
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Conectar Habbo
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent side={side} align={align} sideOffset={sideOffset} className="w-80 bg-amber-50 border-amber-200">
        <PopoverHeader className="border-amber-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-amber-300">
                <AvatarImage 
                  src={habboData ? getAvatarUrl(habboData.figureString, 's') : '/assets/frank.png'}
                  alt={habboAccount.habbo_name}
                />
                <AvatarFallback className="bg-amber-100">
                  {habboAccount.habbo_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${habboData?.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <PopoverTitle className="volter-font text-gray-800 truncate">
                {habboAccount.habbo_name}
              </PopoverTitle>
              <PopoverDescription className="text-xs text-gray-600 volter-font">
                {habboData?.online ? 'Online' : 'Offline'}
              </PopoverDescription>
              {habboData?.memberSince && (
                <PopoverDescription className="text-xs text-gray-500">
                  Membro desde: {new Date(habboData.memberSince).toLocaleDateString('pt-BR')}
                </PopoverDescription>
              )}
            </div>
          </div>
          {habboData?.motto && (
            <div className="mt-2 text-xs text-gray-700 volter-font italic">
              "{habboData.motto}"
            </div>
          )}
        </PopoverHeader>
        
        <PopoverBody className="space-y-3">
          {loading ? (
            <div className="text-center text-sm text-gray-600">{t('messages.loading')}</div>
          ) : (
            <>
              {badges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-800 volter-font mb-2">
                    {t('pages.console.badges')} ({badges.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-6 gap-1">
                      {badges.map((badge) => (
                        <BadgeItem key={badge.code} badge={badge} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Separator className="bg-amber-200" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-700 hover:bg-amber-100 volter-font" 
                size="sm"
                onClick={handleViewProfile}
              >
                <User className="mr-2 h-4 w-4" />
                Ver Perfil Completo
              </Button>
            </>
          )}
        </PopoverBody>
        
        <PopoverFooter>
          <Button 
            variant="outline" 
            className="w-full bg-transparent border-amber-300 text-gray-700 hover:bg-amber-100 volter-font" 
            size="sm"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};
