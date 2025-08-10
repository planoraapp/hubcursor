
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export interface UserProfilePopoverProps {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const UserProfilePopover = ({ children, side = 'bottom', align = 'center' }: UserProfilePopoverProps) => {
  const { habboAccount, isLoggedIn } = useUnifiedAuth();

  if (!isLoggedIn || !habboAccount) {
    return <>{children}</>;
  }

  // Use fallback values for missing properties
  const figureString = habboAccount.figure_string || habboAccount.figureString || 'hd-180-1.ch-255-66.lg-270-82.sh-305-62';
  const motto = habboAccount.motto || 'Sem motto';
  const isOnline = habboAccount.online ?? true;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-80 p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=m`} />
            <AvatarFallback>{habboAccount.habbo_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{habboAccount.habbo_name}</h4>
            <p className="text-sm text-muted-foreground">"{motto}"</p>
            <div className="flex items-center space-x-2">
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm">
            Ver Perfil
          </Button>
          <Button variant="outline" size="sm">
            Configurações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfilePopover;
